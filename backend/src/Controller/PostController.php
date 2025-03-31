<?php

namespace App\Controller;

use App\Entity\Post;
use App\Repository\PostRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Entity\User;

class PostController extends AbstractController
{
    #[Route('/posts', name: 'posts.index', methods: ['GET'])]
    public function index(PostRepository $postRepository, Request $request): JsonResponse
    {

        $page = $request->query->get('page', 1);
        $offset = ($page - 1) * 5;

        $paginator = $postRepository->paginateAllOrderedByLatest($offset, 5);

        if (!$paginator->count()) {
            return $this->json(['error' => 'No posts found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $posts = [];
        foreach ($paginator as $post) {
            $posts[] = [
                'id' => $post->getId(),
                'user_id' => $post->getUser()->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'avatar' => $post->getUser()->getAvatar(),
                'username' => $post->getUser()->getUsername(),
            ];
        }

        $previousPage = $page > 1 ? $page - 1 : null;
        $totalPostsCount = $paginator->count();
        $nextPage = ($totalPostsCount > $page * 5) ? $page + 1 : null;

        return $this->json([
            'posts' => $posts,
            'previous_page' => $previousPage,
            'next_page' => $nextPage
        ]);
    }

    #[Route('/posts', name: 'posts.create', methods: ['POST'])]
    public function createPost(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['content']) || empty(trim($data['content']))) {
            return new JsonResponse(['error' => 'Content is required'], 400);
        }

        if (!$this->getUser()) {
            return new JsonResponse(['error' => 'User not authenticated'], 401);
        }

        $post = new Post();
        $post->setContent($data['content']);
        $post->setCreatedAt(new \DateTime());
        $post->setUser($this->getUser());

        $entityManager->persist($post);
        $entityManager->flush();

        return new JsonResponse([
            'message' => 'Post created successfully',
            'post' => [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'username' => $post->getUser()->getUsername(),
            ]
        ], 201);
    }

    #[Route('/posts/user/{userId}', name: 'posts.get_by_user', methods: ['GET'])]
    public function getPostsByUser(int $userId, PostRepository $postRepository): JsonResponse
    {
        // Fetch posts for the userId
        $posts = $postRepository->findBy(['user' => $userId], ['created_at' => 'DESC']);
    
        if (!$posts) {
            return $this->json(['error' => 'No posts found for this user'], JsonResponse::HTTP_NOT_FOUND);
        }
    
        $response = [];
        foreach ($posts as $post) {
            $response[] = [
                'id' => $post->getId(),
                'user_id' => $post->getUser()->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'avatar' => $post->getUser()->getAvatar(),
                'username' => $post->getUser()->getUsername(),
            ];
        }
    
        return $this->json(['posts' => $response]);
    }
    
    #[Route('/posts/{id}', name: 'posts.delete', methods: ['DELETE'])]
    public function deletePost(int $id, PostRepository $postRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $post = $postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], 404);
        }

        if ($post->getUser() !== $this->getUser()) {
            return new JsonResponse(['error' => 'You are not authorized to delete this post'], 403);
        }

        $entityManager->remove($post);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Post deleted successfully']);
    }
}
