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

class UserController extends AbstractController
{
    #[Route('/signup', name: 'user.signup', methods: ['POST'])]
    public function signup(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        UserPasswordHasherInterface $passwordHasher,
        UserRepository $userRepository,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        // Check if email or username already exists
        $existingUser = $userRepository->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return new JsonResponse(['error' => 'Email is already in use.'], 400);
        }

        $existingUsername = $userRepository->findOneBy(['username' => $data['username']]);
        if ($existingUsername) {
            return new JsonResponse(['error' => 'Username is already taken.'], 400);
        }

        // Create and hash the user password
        $user = new User();
        $user->setUsername($data['username']);
        $user->setEmail($data['email']);
        $user->setPassword(
             $passwordHasher->hashPassword($user, $data['password'])
        );

        // Validate the user entity using Symfony's Validator
        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(['errors' => $errorMessages], 400);
        }

        // Persist the user entity to the database
        $entityManager->persist($user);
        $entityManager->flush();

        // Return a success response
        return new JsonResponse(['message' => 'User registered successfully.'], 201);
    }

    #[Route('/users', name: 'user.login', methods: ['GET'])]
    public function index (UserRepository $userRepository): JsonResponse
    {
        $users = $userRepository->findAll();
        $data = [];

        foreach ($users as $user) {
            $data[] = [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
            ];
        }

        return new JsonResponse($data, 200);
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