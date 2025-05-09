<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Follow;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class FollowController extends AbstractController
{
    #[Route('/follow/{userId}', name: 'follow', methods: ['POST'])]
    public function follow(int $userId, EntityManagerInterface $entityManager): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return new JsonResponse(['error' => 'Invalid user'], 400);
        }

        $userToFollow = $entityManager->getRepository(User::class)->find($userId);

        if (!$userToFollow) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        if ($currentUser === $userToFollow) {
            return new JsonResponse(['error' => 'You cannot follow yourself'], 400);
        }

        $currentUser->follow($userToFollow, $entityManager);

        $entityManager->flush();

        return new JsonResponse(['success' => true]);
    }

    #[Route('/unfollow/{userId}', name: 'unfollow', methods: ['POST'])]
    public function unfollow(int $userId, EntityManagerInterface $entityManager): JsonResponse
    {
        $currentUser = $this->getUser();
        $userToUnfollow = $entityManager->getRepository(User::class)->find($userId);

        if (!$userToUnfollow) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $follow = $entityManager->getRepository(Follow::class)->findOneBy([
            'follower' => $currentUser,
            'followed' => $userToUnfollow
        ]);

        if ($follow) {
            $entityManager->remove($follow);
            $entityManager->flush(); 
        }

        return new JsonResponse(['success' => true]);
    }

    
}
