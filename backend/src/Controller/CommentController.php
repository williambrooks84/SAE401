<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Repository\CommentRepository;
use App\Repository\PostRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\UserRepository;
use App\Entity\Comment;
use App\Entity\Post;
use App\Entity\User;

class CommentController extends AbstractController {

    #[Route('/comments', name: 'comments.index', methods: ['GET'])]
    public function index(Request $request, CommentRepository $commentRepository){
        $postId = $request->query->get('post_id');

        if (!$postId){
            return new JsonResponse(['error' => 'Post ID is required'], 400);
        }

        $comments = $commentRepository->findByPostID($postId);

        return new JsonResponse([
            'comments' => array_map(function ($comment) {
            return [
                'id' => $comment->getId(),
                'content' => $comment->getContent(),
                'created_at' => $comment->getCreatedAt()->format('Y-m-d H:i:s'),
                'post_id' => $comment->getPost()->getId(),
                'user_id' => $comment->getUser()->getId(),
                'username' => $comment->getUser()->getUsername(),
                'avatar' => $comment->getUser()->getAvatar(),
            ];
            }, $comments)
        ]);
    }

    #[Route('/comments', name: 'comments.post', methods: ['POST'])]
    public function postComment(Request $request, PostRepository $postRepository, EntityManagerInterface $entityManager){
        $data = json_decode($request->getContent(), true);

        $content = $data['content'] ?? null;
        $postId = $data['post_id'] ?? null;

        if (!$content || !$postId) {
            return new JsonResponse(['error' => 'Content and Post ID are required'], 400);
        }

        $post = $postRepository->find($postId);

        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], 404);
        }

        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'User is not authenticated'], 401);
        }

        $comment = new Comment();
        $comment->setContent($content);
        $comment->setPost($post);
        $comment->setUser($user);
        $comment->setCreatedAt(new \DateTimeImmutable());

        $entityManager->persist($comment);
        $entityManager->flush();

        return new JsonResponse([
            'message' => 'Comment posted successfully',
            'comment' => [
                'id' => $comment->getId(),
                'content' => $comment->getContent(),
                'created_at' => $comment->getCreatedAt()->format('Y-m-d H:i:s'),
                'post_id' => $comment->getPost()->getId(),
                'user_id' => $comment->getUser()->getId(),
                'username' => $comment->getUser()->getUsername(),
                'avatar' => $comment->getUser()->getAvatar(),
            ]
        ], 201);
    }
}