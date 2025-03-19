<?php

// src/Controller/PostController.php
namespace App\Controller;

use App\Repository\PostRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\Post;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Validator\Validator\ValidatorInterface;


class PostController extends AbstractController
{
    #[Route('/posts', name: 'posts.index', methods: ['GET'])]
    public function index(PostRepository $postRepository, Request $request): Response
    {
        $page = $request->query->get('page', 1); // Default to page 1 if not provided
        $offset = ($page - 1) * 5; // 5 posts per page

        $paginator = $postRepository->paginateAllOrderedByLatest($offset, 5);

        $previousPage = $page > 1 ? $page - 1 : null;
        $totalPostsCount = $paginator->count();
        $nextPage = ($totalPostsCount > $page * 1) ? $page + 1 : null;

        return $this->json([
            'posts' => $paginator,
            'previous_page' => $previousPage,
            'next_page' => $nextPage
        ]);
    }

     // 🚀 Route pour la création d'un post
     #[Route('/posts', name: 'posts.create', methods: ['POST'])]
     public function createPost(Request $request, EntityManagerInterface $entityManager): JsonResponse
     {
         $data = json_decode($request->getContent(), true);
 
         if (!isset($data['content']) || empty(trim($data['content']))) {
             return new JsonResponse(['error' => 'Le contenu est obligatoire'], 400);
         }
 
         if (strlen($data['content']) > 280) {
             return new JsonResponse(['error' => 'Le message ne peut pas dépasser 280 caractères'], 400);
         }
 
         $post = new Post();
         $post->setContent($data['content']);
         $post->setCreatedAt(new \DateTime());
 
         $entityManager->persist($post);
         $entityManager->flush();
 
         return new JsonResponse(['message' => 'Post créé avec succès', 'post' => $post], 201);
     }
}
