<?php

// src/Controller/PostController.php
namespace App\Controller;

use App\Repository\PostRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;


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
}
