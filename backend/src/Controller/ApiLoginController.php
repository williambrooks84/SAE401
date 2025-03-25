<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\HttpFoundation\Response;

final class ApiLoginController extends AbstractController
{
    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(Request $request, UserPasswordHasherInterface $passwordHasher, UserRepository $userRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        // Find the user by email
        $user = $userRepository->findOneBy(['email' => $email]);
       
        if($passwordHasher->isPasswordValid($user, $password)) {
            // If no user found or password doesn't match, return 401
            return $this->json(['error' => 'Invalid xddfxdfxdcredentials.'], Response::HTTP_UNAUTHORIZED);
        }

        // Generate a token (for example JWT or any other method)
        $token = bin2hex(random_bytes(16)); // Simple random token for example

        // You could save the token in the database or cache for validation on future requests

        return $this->json([
            'user' => $user->getUserIdentifier(),
            'token' => $token,
        ]);
    }
}
