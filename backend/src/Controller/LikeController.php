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
        // Check if post exists
        $post = $this->postRepository->find($postId);
        if (!$post) {
            return $this->json(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        // Check if the user has already liked the post
        $existingLike = $this->likeRepository->findOneBy([
            'post' => $post,
            'user' => $user,
        ]);

        if ($existingLike) {
            return $this->json(['message' => 'You have already liked this post'], Response::HTTP_BAD_REQUEST);
        }

        // Create a new like
        $like = new Like();
        $like->setUser($user);
        $like->setPost($post);
        $like->setCreatedAt(new \DateTimeImmutable());

        // Save the like
        $this->entityManager->persist($like);
        $this->entityManager->flush();

        return $this->json(['message' => 'Post liked successfully'], Response::HTTP_OK);
    }

    #[Route('/unlike/{postId}', name: 'app_unlike_post', methods: ['DELETE'])]
    public function unlikePost(int $postId, UserInterface $user): Response
    {
        // Check if post exists
        $post = $this->postRepository->find($postId);
        if (!$post) {
            return $this->json(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        // Check if the user has liked the post
        $existingLike = $this->likeRepository->findOneBy([
            'post' => $post,
            'user' => $user,
        ]);

        if (!$existingLike) {
            return $this->json(['message' => 'You have not liked this post'], Response::HTTP_BAD_REQUEST);
        }

        // Remove the like
        $this->entityManager->remove($existingLike);
        $this->entityManager->flush();

        return $this->json(['message' => 'Post unliked successfully'], Response::HTTP_OK);
    }

    #[Route('/likes/count/{postId}', name: 'app_get_likes_count', methods: ['GET'])]
    public function getLikesCount(int $postId): Response
    {
        // Find the post
        $post = $this->postRepository->find($postId);

        // Check if post exists
        if (!$post) {
            return $this->json(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        // Count likes for the post
        $likesCount = $this->likeRepository->count(['post' => $post]);

        // Return the like count as a JSON response
        return $this->json(['likesCount' => $likesCount]);
    }

    #[Route('/likes/status/{postId}', name: 'app_get_like_status', methods: ['GET'])]
    public function getLikeStatus(int $postId): Response
    {
        $user = $this->getUser(); // Get the currently logged-in user

        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        // Find the post by postId
        $post = $this->postRepository->find($postId);

        if (!$post) {
            return $this->json(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        // Check if the current user has liked the post
        $like = $this->likeRepository->findOneBy(['post' => $post, 'user' => $user]);

        // Return whether the user has liked the post
        return $this->json(['liked' => $like !== null]);
    }
}
