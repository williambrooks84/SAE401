<?php

namespace App\Controller;

use App\Entity\User;
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

    #[Route('/profile/{id}', name: 'user.profile', methods: ['GET'])]
    public function getProfile(int $id, UserRepository $userRepository): JsonResponse
    {
        // Find the user by ID
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found.'], 404); // Not Found
        }

        return new JsonResponse([
            'user_id' => $user->getId(),
            'username' => $user->getUsername(),
            'banner' => $user->getBanner(),
            'avatar' => $user->getAvatar(),
            'location' => $user->getLocation(),
            'bio' => $user->getBio(),
            'website' => $user->getWebsite(),
        ]);
    }
}