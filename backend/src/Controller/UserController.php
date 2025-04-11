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
use App\Repository\TokenRepository;
use App\Repository\UserBlockRepository;

class UserController extends AbstractController
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    #[Route('/users', name: 'user.login', methods: ['GET'])]
    public function index(UserRepository $userRepository): JsonResponse
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
        $authorizationHeader = $request->headers->get('Authorization');

        if (!$authorizationHeader) {
            return new JsonResponse(['error' => 'Authorization header not found'], 400);
        }

        $token = str_replace('Bearer ', '', $authorizationHeader);

        $storedToken = $tokenRepository->findOneBy(['value' => $token]);

        if (!$storedToken) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }

        $user = $storedToken->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        return new JsonResponse([
            'user_id' => $user->getId(),
            'role' => $user->getRoles(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'is_verified' => $user->getIsVerified(),
            'banner' => $user->getBanner(),
            'avatar' => $user->getAvatar(),
            'location' => $user->getLocation(),
            'bio' => $user->getBio(),
            'website' => $user->getWebsite(),
        ]);
    }

    #[Route('/update', name: 'user.update', methods: ['PATCH'])]
    public function update(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        UserRepository $userRepository
    ): JsonResponse {

        $data = json_decode($request->getContent(), true);

        if (!isset($data['username']) || !isset($data['email']) || !isset($data['id'])) {
            return new JsonResponse(['error' => 'Username, email, and ID are required.'], 400);
        }

        $user = $this->getUser(); 

        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated.'], 401);  
        }

        error_log('User Roles: ' . implode(', ', $user->getRoles()));

        if (!in_array('ROLE_ADMIN', $user->getRoles())) {
            return new JsonResponse(['error' => 'Access denied. Admins only.'], 403);
        }

        $userToUpdate = $userRepository->find($data['id']);
        if (!$userToUpdate) {
            return new JsonResponse(['error' => 'User not found.'], 404);
        }

        $existingUserByUsername = $userRepository->findOneBy(['username' => $data['username']]);
        if ($existingUserByUsername && $existingUserByUsername->getId() !== $userToUpdate->getId()) {
            return new JsonResponse(['error' => 'Username is already taken.'], 400);
        }

        $existingUserByEmail = $userRepository->findOneBy(['email' => $data['email']]);
        if ($existingUserByEmail && $existingUserByEmail->getId() !== $userToUpdate->getId()) {
            return new JsonResponse(['error' => 'Email is already taken.'], 400);
        }

        $userToUpdate->setUsername($data['username']);
        $userToUpdate->setEmail($data['email']);

        $errors = $validator->validate($userToUpdate);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(['errors' => $errorMessages], 400);
        }

        $entityManager->flush();

        return new JsonResponse(['message' => 'User updated successfully.'], 200);
    }

    #[Route('/logout', name: 'user.logout', methods: ['DELETE'])]
    public function logout(Request $request, TokenRepository $tokenRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $authorizationHeader = $request->headers->get('Authorization');
        if (!$authorizationHeader) {
            return new JsonResponse(['error' => 'Authorization header not found'], 400);
        }

        $token = str_replace('Bearer ', '', $authorizationHeader);

        $storedToken = $tokenRepository->findOneBy(['value' => $token]);
        if (!$storedToken) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }

        $entityManager->remove($storedToken);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Logged out successfully.'], 200);
    }

    #[Route('/profile/{id}', name: 'profile.get', methods: ['GET'])]
    public function getProfile(int $id, UserRepository $userRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $followerCount = count($entityManager->getRepository(Follow::class)->findBy(['followed' => $user]));

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

        $currentUser = $this->getUser(); 

        if ($currentUser === $userToFollow) {
            return new JsonResponse(['error' => 'You cannot follow yourself'], 400);
        }

        $existingFollow = $entityManager->getRepository(Follow::class)->findOneBy([
            'follower' => $currentUser,
            'followed' => $userToFollow,
        ]);

        if ($existingFollow) {
            return new JsonResponse(['error' => 'You are already following this user'], 400);
        }

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

        $currentUser = $this->getUser(); 

        $existingFollow = $entityManager->getRepository(Follow::class)->findOneBy([
            'follower' => $currentUser,
            'followed' => $userToUnfollow,
        ]);

        if (!$existingFollow) {
            return new JsonResponse(['error' => 'You are not following this user'], 400);
        }

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
            $follower = $follow->getFollower();
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

        $currentUser = $this->getUser();

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

        $roles[] = 'ROLE_USER_BLOCKED'; 
        $userToBlock->setRoles(array_unique($roles));

        $entityManager->flush();

        return new JsonResponse(['message' => 'User blocked successfully.'], 200);
    }

    #[Route('/users/{id}/block', name: 'users.block.user', methods: ['POST'])]
    public function blockUserByUser(int $id, UserRepository $userRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $userToBlock = $userRepository->find($id);
        if (!$userToBlock) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        if ($currentUser === $userToBlock) {
            return new JsonResponse(['error' => 'You cannot block yourself'], 400);
        }

        $existingBlock = $entityManager->getRepository(\App\Entity\UserBlock::class)->findOneBy([
            'blocker' => $currentUser,
            'blocked' => $userToBlock
        ]);

        if ($existingBlock) {
            return new JsonResponse(['error' => 'User already blocked'], 400);
        }

        // Block the user
        $block = new \App\Entity\UserBlock();
        $block->setBlocker($currentUser);
        $block->setBlocked($userToBlock);
        $block->setBlockedAt(new \DateTimeImmutable());
        $entityManager->persist($block);
        $entityManager->flush();

        $this->unfollow($currentUser, $userToBlock, $entityManager);

        return new JsonResponse(['message' => 'User blocked successfully'], 201);
    }

    private function unfollow($user1, $user2)
    {
        $followingRepo = $this->entityManager->getRepository(\App\Entity\Follow::class);

        $follow = $followingRepo->findOneBy([
            'follower' => $user1,
            'followed' => $user2 
        ]);

        if ($follow) {
            $this->entityManager->remove($follow);
            $this->entityManager->flush();  
        }
    }

    #[Route('/users/{id}/block', name: 'users.unblock.user', methods: ['DELETE'])]
    public function unblockUserByUser(int $id, UserRepository $userRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $userToUnblock = $userRepository->find($id);
        if (!$userToUnblock) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $block = $entityManager->getRepository(\App\Entity\UserBlock::class)->findOneBy([
            'blocker' => $currentUser,
            'blocked' => $userToUnblock
        ]);

        if (!$block) {
            return new JsonResponse(['error' => 'User is not blocked'], 400);
        }

        $entityManager->remove($block);
        $entityManager->flush();

        return new JsonResponse(['message' => 'User unblocked successfully'], 200);
    }

    #[Route('/users/{id}/is-blocked', name: 'users.is_blocked', methods: ['GET'])]
    public function isBlocked(int $id, UserRepository $userRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $userToCheck = $userRepository->find($id);
        if (!$userToCheck) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $blockerToBlocked = $entityManager->getRepository(\App\Entity\UserBlock::class)->findOneBy([
            'blocker' => $currentUser,
            'blocked' => $userToCheck,
        ]);

        $blockedToBlocker = $entityManager->getRepository(\App\Entity\UserBlock::class)->findOneBy([
            'blocker' => $userToCheck,
            'blocked' => $currentUser,
        ]);

        $isBlockedByAdmin = in_array('ROLE_USER_BLOCKED', $userToCheck->getRoles());

        return new JsonResponse([
            'isBlockedByCurrentUser' => $blockerToBlocked !== null,
            'isBlockedByProfileUser' => $blockedToBlocker !== null,
            'isBlockedByAdmin' => $isBlockedByAdmin,
        ]);
    }

    #[Route('/blocklist/{id}', name: 'users.blocklist', methods: ['GET'])]
    public function getBlockList(int $id, UserBlockRepository $userBlockRepository): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        if (!$currentUser instanceof User || $currentUser->getId() !== $id) {
            return new JsonResponse(['error' => 'Access denied'], 403);
        }

        $blockList = $userBlockRepository->findBy(['blocker' => $currentUser]);

        if (empty($blockList)) {
            return new JsonResponse([], 200);
        }

        $blockedUsers = [];
        foreach ($blockList as $block) {
            $blockedUser = $block->getBlocked();
            if ($blockedUser) {
                $blockedUsers[] = [
                    'id' => $blockedUser->getId(),
                    'username' => $blockedUser->getUsername(),
                    'avatar' => $blockedUser->getAvatar(),
                    'blocked_at' => $block->getBlockedAt()->format('Y-m-d H:i:s'),
                ];
            }
        }

        return new JsonResponse($blockedUsers, 200);
    }
}
