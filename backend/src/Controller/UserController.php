<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Repository\TokenRepository;

class UserController extends AbstractController
{
    #[Route('/users', name: 'user.login', methods: ['GET'])]
    public function index (UserRepository $userRepository): JsonResponse
    {
        $users = $userRepository->findAll();
        $data = [];

        foreach ($users as $user) {
            $data[] = [
                'id' => $user->getId(),
                'roles' => $user->getRoles(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'is_Verified' => $user->getIsVerified(),
            ];
        }

        return new JsonResponse($data, 200);
    }

    #[Route('/token', name: 'user.token', methods: ['GET'])]
    public function getUserByToken(Request $request, TokenRepository $tokenRepository): JsonResponse
    {
        // Get the token from the Authorization header (it should be in the form of "Bearer <token>")
        $authorizationHeader = $request->headers->get('Authorization');
        
        if (!$authorizationHeader) {
            return new JsonResponse(['error' => 'Authorization header not found'], 400);
        }
    
        // Extract the token from the "Bearer <token>" string
        $token = str_replace('Bearer ', '', $authorizationHeader);
    
        // Look for the token in the database
        $storedToken = $tokenRepository->findOneBy(['value' => $token]);
    
        if (!$storedToken) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }
    
        // Get the user associated with the token
        $user = $storedToken->getUser(); // Use getUser() instead of getUserId()
    
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }
    
        // Return the user data (including username, email, etc.)
        return new JsonResponse([
            'user_id' => $user->getId(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'is_verified' => $user->getIsVerified(),
        ]);
    }
    

    #[Route('/update', name: 'user.update', methods: ['PATCH'])]
    public function update(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        UserRepository $userRepository,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        // Validate input data
        if (!isset($data['username']) || !isset($data['email'])) {
            return new JsonResponse(['error' => 'Username and email are required.'], 400);
        }

        // Find the user by ID (assuming the ID is passed in the request)
        if (!isset($data['id'])) {
            return new JsonResponse(['error' => 'User ID is required.'], 400);
        }

        $user = $userRepository->find($data['id']);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found.'], 404);
        }

        // Update user details
        $user->setUsername($data['username']);
        $user->setEmail($data['email']);

        // Validate the updated user entity
        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(['errors' => $errorMessages], 400);
        }

        // Save changes to the database
        $entityManager->flush();

        return new JsonResponse(['message' => 'User updated successfully.'], 200);
    }

}