<?php

namespace App\Controller;

use App\Entity\Token;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\HttpFoundation\Response;

final class ApiLoginController extends AbstractController
{
    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(
        Request $request, 
        UserPasswordHasherInterface $passwordHasher, 
        UserRepository $userRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email'], $data['password'])) {
            return $this->json(['error' => 'Invalid request data'], Response::HTTP_BAD_REQUEST);
        }

        $email = $data['email'];
        $password = $data['password'];

        // Check if the user exists
        $user = $userRepository->findOneBy(['email' => $email]);

        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_UNAUTHORIZED);
        }

        // Check if the user is verified
        if (!$user->getIsVerified()) {
            return $this->json(['error' => 'Please verify your email address'], Response::HTTP_FORBIDDEN);
        }

        // Check if the user is blocked
        if (in_array('ROLE_USER_BLOCKED', $user->getRoles())) {
            return $this->json(['error' => 'Your account has been blocked. Please contact support.'], Response::HTTP_FORBIDDEN);
        }

        // Validate password
        if (!$passwordHasher->isPasswordValid($user, $password)) {
            return $this->json(['error' => 'Invalid password'], Response::HTTP_UNAUTHORIZED);
        }

        // Generate a token
        $token = new Token($user);
        $em->persist($token);
        $em->flush();

        // Return the response
        return $this->json([
            'user' => [
                'id' => $user->getId(),
            ],
            'token' => $token->getValue(),
        ]);
    }
}
