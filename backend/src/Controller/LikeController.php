<?php

namespace App\Controller;

use App\Entity\Like;
use App\Repository\LikeRepository;
use App\Repository\PostRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;

class LikeController extends AbstractController
{
    private $entityManager;
    private $likeRepository;
    private $postRepository;

    public function __construct(EntityManagerInterface $entityManager, LikeRepository $likeRepository, PostRepository $postRepository)
    {
        $this->entityManager = $entityManager;
        $this->likeRepository = $likeRepository;
        $this->postRepository = $postRepository;
    }

    #[Route('/like/{postId}', name: 'app_like_post', methods: ['POST'])]
    public function likePost(int $postId, UserInterface $user): Response
    {
        $post = $this->postRepository->find($postId);
        if (!$post) {
            return $this->json(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        $existingLike = $this->likeRepository->findOneBy([
            'post' => $post,
            'user' => $user,
        ]);

        if ($existingLike) {
            return $this->json(['message' => 'You have already liked this post'], Response::HTTP_BAD_REQUEST);
        }

        $like = new Like();
        $like->setUser($user);
        $like->setPost($post);
        $like->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($like);
        $this->entityManager->flush();

        return $this->json(['message' => 'Post liked successfully'], Response::HTTP_OK);
    }

    #[Route('/unlike/{postId}', name: 'app_unlike_post', methods: ['DELETE'])]
    public function unlikePost(int $postId, UserInterface $user): Response
    {
        $post = $this->postRepository->find($postId);
        if (!$post) {
            return $this->json(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        $existingLike = $this->likeRepository->findOneBy([
            'post' => $post,
            'user' => $user,
        ]);

        if (!$existingLike) {
            return $this->json(['message' => 'You have not liked this post'], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->remove($existingLike);
        $this->entityManager->flush();

        return $this->json(['message' => 'Post unliked successfully'], Response::HTTP_OK);
    }

    #[Route('/likes/count/{postId}', name: 'app_get_likes_count', methods: ['GET'])]
    public function getLikesCount(int $postId): Response
    {
        $post = $this->postRepository->find($postId);

        if (!$post) {
            return $this->json(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        $likesCount = $this->likeRepository->count(['post' => $post]);

        return $this->json(['likesCount' => $likesCount]);
    }

    #[Route('/likes/status/{postId}', name: 'app_get_like_status', methods: ['GET'])]
    public function getLikeStatus(int $postId): Response
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $post = $this->postRepository->find($postId);

        if (!$post) {
            return $this->json(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        $like = $this->likeRepository->findOneBy(['post' => $post, 'user' => $user]);

        return $this->json(['liked' => $like !== null]);
    }
}
