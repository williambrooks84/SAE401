<?php

namespace App\Controller;

use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use App\Service\FileUploader;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Repository\PostRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Entity\Post;
use App\Entity\Like;
use App\Repository\UserRepository;
use App\Entity\User;

class PostController extends AbstractController
{
    private FileUploader $fileUploader;

    public function __construct(FileUploader $fileUploader)
    {
        $this->fileUploader = $fileUploader;
    }

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
            $user = $post->getUser();
            $roles = $user->getRoles();
            $isBlocked = in_array('ROLE_USER_BLOCKED', $roles);

            $content = $isBlocked ? 'This user has been blocked for violation of terms of service' : $post->getContent();

            $posts[] = [
                'id' => $post->getId(),
                'user_id' => $user->getId(),
                'content' => $content,
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'avatar' => $user->getAvatar(),
                'username' => $user->getUsername(),
                'file_paths' => $post->getFilePaths(),
                'is_blocked' => $isBlocked,
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
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], 401);
        }

        $content = $request->request->get('content');
        $files = $request->files->all()['files'] ?? [];
        $filePaths = [];

        if (empty(trim($content)) && empty($files)) {
            return new JsonResponse(['error' => 'Content or at least one file is required'], 400);
        }

        if ($files) {
            $files = is_array($files) ? $files : [$files]; // Ensure $files is always an array

            foreach ($files as $file) {
                if (!in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'video/mp4'])) {
                    return new JsonResponse(['error' => 'Only JPG, PNG images and MP4 videos are allowed'], 400);
                }

                $fileName = uniqid('post_') . '.' . $file->guessExtension();

                try {
                    $file->move($this->getParameter('kernel.project_dir') . '/public/assets/posts/', $fileName);
                    $filePaths[] = '/assets/posts/' . $fileName;
                } catch (\Exception $e) {
                    return new JsonResponse(['error' => 'Error moving file: ' . $e->getMessage()], 500);
                }
            }
        }

        $post = new Post();
        $post->setContent($content);
        $post->setCreatedAt(new \DateTime());
        $post->setUser($user);
        $post->setFilePaths($filePaths); 

        $entityManager->persist($post);
        $entityManager->flush();

        return new JsonResponse([
            'message' => 'Post created successfully',
            'file_paths' => $filePaths,
        ], 201);
    }

    #[Route('/posts/user/{userId}', name: 'posts.get_by_user', methods: ['GET'])]
    public function getPostsByUser(int $userId, PostRepository $postRepository): JsonResponse
    {
        $posts = $postRepository->findBy(['user' => $userId], ['created_at' => 'DESC']);
        $isBlocked = false;

        if (!$posts) {
            return $this->json(['error' => 'No posts found for this user'], JsonResponse::HTTP_NOT_FOUND);
        }

        $isBlocked = in_array('ROLE_USER_BLOCKED', $posts[0]->getUser()->getRoles());

        $response = [];
        foreach ($posts as $post) {
            $response[] = [
                'id' => $post->getId(),
                'user_id' => $post->getUser()->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'avatar' => $post->getUser()->getAvatar(),
                'username' => $post->getUser()->getUsername(),
                'is_blocked' => $isBlocked,
                'file_paths' => $post->getFilePaths(),
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

    #[Route('/posts/{id}/like', name: 'posts.like', methods: ['POST'])]
    public function likePost(int $id, PostRepository $postRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $post = $postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], 404);
        }

        $user = $this->getUser();

        $existingLike = $post->getLikes()->filter(function ($like) use ($user) {
            return $like->getUser() === $user;
        })->first();

        if ($existingLike) {
            return new JsonResponse(['error' => 'You already liked this post'], 400);
        }

        $like = new Like();
        $like->setUser($user);
        $like->setPost($post);

        $entityManager->persist($like);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Post liked successfully']);
    }

    #[Route('/posts/{id}/unlike', name: 'posts.unlike', methods: ['DELETE'])]
    public function unlikePost(int $id, PostRepository $postRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $post = $postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], 404);
        }

        $user = $this->getUser();

        $existingLike = $post->getLikes()->filter(function ($like) use ($user) {
            return $like->getUser() === $user;
        })->first();

        if (!$existingLike) {
            return new JsonResponse(['error' => 'You have not liked this post'], 400);
        }

        $entityManager->remove($existingLike);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Post unliked successfully']);
    }

    #[Route('/posts/{id}/like-status', name: 'posts.like_status', methods: ['GET'])]
    public function getLikeStatus(int $id, PostRepository $postRepository): JsonResponse
    {
        $post = $postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], 404);
        }

        $likeCount = count($post->getLikes());

        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse([
                'like_count' => $likeCount,
                'liked' => false,
            ]);
        }

        $userLiked = $post->getLikes()->filter(function ($like) use ($user) {
            return $like->getUser() === $user;
        })->isEmpty() ? false : true;

        return new JsonResponse([
            'like_count' => $likeCount,
            'liked' => $userLiked,
        ]);
    }

    #[Route('/posts/following', name: 'posts.following', methods: ['GET'])]
    public function getPostsByFollowing(PostRepository $postRepository, UserRepository $userRepository): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $followedUserIds = $userRepository->findFollowedUserIds($user);

        if (empty($followedUserIds)) {
            return $this->json(['posts' => []]);
        }

        $posts = $postRepository->findByUsers($followedUserIds);

        usort($posts, function ($a, $b) {
            return $b->getCreatedAt() <=> $a->getCreatedAt();
        });

        $response = array_map(function ($post) {
            $user = $post->getUser();
            return [
                'id' => $post->getId(),
                'user_id' => $user->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'avatar' => $user->getAvatar(),
                'username' => $user->getUsername(),
                'file_paths' => $post->getFilePaths(),
                'is_blocked' => in_array('ROLE_USER_BLOCKED', $user->getRoles()),
            ];
        }, $posts);

        return $this->json([
            'posts' => $response,
            'user_id' => $user instanceof User ? $user->getId() : null
        ]);
    }

    #[Route('/posts/{id}', name: 'posts.fetch', methods: ['GET'])]
    public function GetPostById(PostRepository $postRepository, int $id): JsonResponse
    {
        $post = $postRepository->find($id);

        if (!$post) {
            return $this->json(['error' => 'Post not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $user = $post->getUser();

        return $this->json([
            'id' => $post->getId(),
            'user_id' => $user->getId(),
            'content' => $post->getContent(),
            'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
            'avatar' => $user->getAvatar(),
            'username' => $user->getUsername(),
            'file_paths' => $post->getFilePaths(),
            'is_blocked' => in_array('ROLE_USER_BLOCKED', $user->getRoles()),
        ]);
    }

    #[Route('/posts/{id}', name: 'posts.edit', methods: ['PATCH'])]
    public function EditPost(
        int $id,
        Request $request,
        PostRepository $postRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $post = $postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $user = $this->getUser();
        if ($post->getUser() !== $user) {
            return new JsonResponse(['error' => 'You are not authorized to edit this post'], JsonResponse::HTTP_FORBIDDEN);
        }
        if ($request->headers->get('Content-Type') === 'application/json') {
            $data = json_decode($request->getContent(), true);
            $content = $data['content'] ?? $post->getContent();
        } else {
            $content = $request->request->get('content') ?? $post->getContent();
        }

        if ($content !== $post->getContent()) {
            $post->setContent($content);
        }

        $filePaths = $post->getFilePaths();

        $post->setContent($content);
        $post->setFilePaths($filePaths);

        $entityManager->persist($post);
        $entityManager->flush();

        $entityManager->refresh($post);

        return new JsonResponse([
            'message' => 'Post updated successfully',
            'post' => [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'file_paths' => $post->getFilePaths(),
            ],
        ]);
    }

    #[Route('/posts/{id}/comments/count', name: 'posts.comments_count', methods: ['GET'])]
    public function countComments(int $id, PostRepository $postRepository): JsonResponse
    {
        $post = $postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $commentCount = count($post->getComments());

        return new JsonResponse(['comment_count' => $commentCount]);
    }

    #[Route('/dashboardposts', name: 'posts.dashboardindex', methods: ['GET'])]
    public function dashboardIndex(PostRepository $postRepository): JsonResponse
    {
        $paginator = $postRepository->paginateAllOrderedByLatest(0, PHP_INT_MAX);

        if (!$paginator->count()) {
            return $this->json(['error' => 'No posts found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $posts = [];
        foreach ($paginator as $post) {
            $user = $post->getUser();
            $roles = $user->getRoles();
            $isBlocked = in_array('ROLE_USER_BLOCKED', $roles);

            $content = $isBlocked ? 'This user has been blocked for violation of terms of service' : $post->getContent();

            $posts[] = [
                'id' => $post->getId(),
                'user_id' => $user->getId(),
                'content' => $content,
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'avatar' => $user->getAvatar(),
                'username' => $user->getUsername(),
                'file_paths' => $post->getFilePaths(),
                'is_blocked' => $isBlocked,
            ];
        }

        return $this->json(['posts' => $posts]);
    }

    #[Route('/censor/{id}', name: 'posts.censor', methods: ['PATCH'])]
    public function censorPost(int $id, PostRepository $postRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $post = $postRepository->find($id);
        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], 404);
        }
    
        $post->setContent('This post has been censored');
        $post->setFilePaths([]);
        $entityManager->persist($post);
        $entityManager->flush();
    
        return new JsonResponse(['message' => 'Post censored successfully']);
    }
    
}
