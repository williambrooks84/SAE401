<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Post;
use App\Entity\Follow;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Repository\TokenRepository;

class UserController extends AbstractController
{
    #[Route('/users', name: 'user.login', methods: ['GET'])]
    public function index (UserRepository $userRepository): JsonResponse
    {
        $users = $userRepository->findAll();
        $data = [];

        foreach ($users as $user) {
            $data[] = [
                'id' => $user->getId(),
                'roles' => $user->getRoles(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'is_Verified' => $user->getIsVerified(),
            ];
        }

        return new JsonResponse($data, 200);
    }

    #[Route('/token', name: 'user.token', methods: ['GET'])]
    public function getUserByToken(Request $request, TokenRepository $tokenRepository): JsonResponse
    {
        // Get the token from the Authorization header (it should be in the form of "Bearer <token>")
        $authorizationHeader = $request->headers->get('Authorization');
        
        if (!$authorizationHeader) {
            return new JsonResponse(['error' => 'Authorization header not found'], 400);
        }
    
        // Extract the token from the "Bearer <token>" string
        $token = str_replace('Bearer ', '', $authorizationHeader);
    
        // Look for the token in the database
        $storedToken = $tokenRepository->findOneBy(['value' => $token]);
    
        if (!$storedToken) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }
    
        // Get the user associated with the token
        $user = $storedToken->getUser(); // Use getUser() instead of getUserId()
    
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }
    
        // Return the user data (including username, email, etc.)
        return new JsonResponse([
            'user_id' => $user->getId(),
            'role' => $user->getRoles(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'is_verified' => $user->getIsVerified(),
        ]);
    }
    
    #[Route('/update', name: 'user.update', methods: ['PATCH'])]
    public function update(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        UserRepository $userRepository
    ): JsonResponse {
        // Decode the JSON request content
        $data = json_decode($request->getContent(), true);
    
        // Check if required fields (username, email, and ID) are present in the request
        if (!isset($data['username']) || !isset($data['email']) || !isset($data['id'])) {
            return new JsonResponse(['error' => 'Username, email, and ID are required.'], 400);
        }
    
        // Ensure user is authenticated and has role 'ROLE_ADMIN'
        $user = $this->getUser(); // Retrieve the authenticated user
    
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated.'], 401);  // Unauthorized
        }
    
        // Log the user roles for debugging purposes
        error_log('User Roles: ' . implode(', ', $user->getRoles()));
    
        if (!in_array('ROLE_ADMIN', $user->getRoles())) {
            return new JsonResponse(['error' => 'Access denied. Admins only.'], 403);
        }
    
        // Find the user by ID
        $userToUpdate = $userRepository->find($data['id']);
        if (!$userToUpdate) {
            return new JsonResponse(['error' => 'User not found.'], 404);
        }
    
        // Check if the new username or email already exists in the database
        $existingUserByUsername = $userRepository->findOneBy(['username' => $data['username']]);
        if ($existingUserByUsername && $existingUserByUsername->getId() !== $userToUpdate->getId()) {
            return new JsonResponse(['error' => 'Username is already taken.'], 400);
        }
    
        $existingUserByEmail = $userRepository->findOneBy(['email' => $data['email']]);
        if ($existingUserByEmail && $existingUserByEmail->getId() !== $userToUpdate->getId()) {
            return new JsonResponse(['error' => 'Email is already taken.'], 400);
        }
    
        // Update the user details (username and email)
        $userToUpdate->setUsername($data['username']);
        $userToUpdate->setEmail($data['email']);
    
        // Validate the updated user entity
        $errors = $validator->validate($userToUpdate);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(['errors' => $errorMessages], 400);
        }
    
        // Persist the changes to the database
        $entityManager->flush();
    
        // Return success response
        return new JsonResponse(['message' => 'User updated successfully.'], 200);
    }

    #[Route('/logout', name: 'user.logout', methods: ['DELETE'])]
    public function logout(Request $request, TokenRepository $tokenRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        // Get the token from the Authorization header
        $authorizationHeader = $request->headers->get('Authorization');
        if (!$authorizationHeader) {
            return new JsonResponse(['error' => 'Authorization header not found'], 400);
        }

        // Extract the token from the "Bearer <token>" string
        $token = str_replace('Bearer ', '', $authorizationHeader);

        // Find the token in the database
        $storedToken = $tokenRepository->findOneBy(['value' => $token]);
        if (!$storedToken) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }

        // Remove the token from the database
        $entityManager->remove($storedToken);
        $entityManager->flush();

        // Return success response
        return new JsonResponse(['message' => 'Logged out successfully.'], 200);
    }

    #[Route('/profile/{id}', name: 'profile.get', methods: ['GET'])]
    public function getProfile(int $id, UserRepository $userRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        // Get follower count
        $followerCount = count($entityManager->getRepository(Follow::class)->findBy(['followed' => $user]));

        // Get following count
        $followingCount = count($entityManager->getRepository(Follow::class)->findBy(['follower' => $user]));

        return new JsonResponse([
            'username' => $user->getUsername(),
            'banner' => $user->getBanner(),
            'avatar' => $user->getAvatar(),
            'location' => $user->getLocation(),
            'bio' => $user->getBio(),
            'website' => $user->getWebsite(),
            'follower_count' => $followerCount,
            'following_count' => $followingCount,
            'is_blocked' => in_array('ROLE_USER_BLOCKED', $user->getRoles()),
        ]);
    }

    #[Route('/users/{id}/follow', name: 'users.follow', methods: ['POST'])]
    public function followUser(int $id, UserRepository $userRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $userToFollow = $userRepository->find($id);

        if (!$userToFollow) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $currentUser = $this->getUser(); // Assuming user is authenticated and can be retrieved this way

        if ($currentUser === $userToFollow) {
            return new JsonResponse(['error' => 'You cannot follow yourself'], 400);
        }

        // Check if the current user is already following the target user
        $existingFollow = $entityManager->getRepository(Follow::class)->findOneBy([
            'follower' => $currentUser,
            'followed' => $userToFollow,
        ]);

        if ($existingFollow) {
            return new JsonResponse(['error' => 'You are already following this user'], 400);
        }

        // Create a new follow relationship
        $follow = new Follow();
        $follow->setFollower($currentUser);
        $follow->setFollowed($userToFollow);

        $entityManager->persist($follow);
        $entityManager->flush();

        return new JsonResponse(['message' => 'User followed successfully']);
    }

    #[Route('/users/{id}/unfollow', name: 'users.unfollow', methods: ['DELETE'])]
    public function unfollowUser(int $id, UserRepository $userRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $userToUnfollow = $userRepository->find($id);

        if (!$userToUnfollow) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $currentUser = $this->getUser(); // Assuming user is authenticated and can be retrieved this way

        // Check if the current user is following the target user
        $existingFollow = $entityManager->getRepository(Follow::class)->findOneBy([
            'follower' => $currentUser,
            'followed' => $userToUnfollow,
        ]);

        if (!$existingFollow) {
            return new JsonResponse(['error' => 'You are not following this user'], 400);
        }

        // Remove the follow relationship
        $entityManager->remove($existingFollow);
        $entityManager->flush();

        return new JsonResponse(['message' => 'User unfollowed successfully']);
    }

    #[Route('/users/{id}/followers', name: 'users.followers', methods: ['GET'])]
    public function getFollowers(int $id, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $followers = $user->getFollowers();

        $followerData = [];
        foreach ($followers as $follow) {
            $follower = $follow->getFollower(); // Assuming Follow entity has a getFollower() method
            $followerData[] = [
                'id' => $follower->getId(),
                'username' => $follower->getUsername(),
                'email' => $follower->getEmail(),
            ];
        }

        return new JsonResponse($followerData, 200);
    }

    #[Route('/users/{id}/following', name: 'users.following', methods: ['GET'])]
    public function getFollowing(int $id, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $following = $user->getFollowing();

        $followerData = [];
        foreach ($following as $followingUser) {
            $followerData[] = [
                'id' => $followingUser->getId(),
                'username' => $followingUser->getUsername(),
                'email' => $followingUser->getEmail(),
                'total_followers' => count($following),
            ];
        }

        return new JsonResponse($followerData, 200);
    }
    
    #[Route('/users/isFollowing/{id}', name: 'users.isfollowing', methods: ['GET'])]
    public function isFollowing(int $id, UserRepository $userRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $userToCheck = $userRepository->find($id);

        if (!$userToCheck) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $currentUser = $this->getUser(); // Assuming user is authenticated and can be retrieved this way

        // Check if the current user is following the target user
        $existingFollow = $entityManager->getRepository(Follow::class)->findOneBy([
            'follower' => $currentUser,
            'followed' => $userToCheck,
        ]);

        return new JsonResponse(['is_following' => (bool)$existingFollow]);
    }

    #[Route('/users/block/{id}', name: 'users.block', methods: ['PATCH'])]
    public function blockUser(int $id, UserRepository $userRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $this->getUser();

        if (!$user || !in_array('ROLE_ADMIN', $user->getRoles())) {
            return new JsonResponse(['error' => 'Access denied. Admins only.'], 403);
        }

        $userToBlock = $userRepository->find($id);
        if (!$userToBlock) {
            return new JsonResponse(['error' => 'User not found.'], 404);
        }

        $roles = $userToBlock->getRoles();
        if (in_array('ROLE_USER_BLOCKED', $roles)) {
            return new JsonResponse(['error' => 'User is already blocked.'], 400);
        }

        $roles[] = 'ROLE_USER_BLOCKED'; // Ajouter le rôle bloqué
        $userToBlock->setRoles(array_unique($roles));

        $entityManager->flush();

        return new JsonResponse(['message' => 'User blocked successfully.'], 200);
    }

}