<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\RegistrationFormType;
use App\Repository\UserRepository;
use App\Security\EmailVerifier;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mime\Address;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

class RegistrationController extends AbstractController
{
    public function __construct(private EmailVerifier $emailVerifier)
    {
    }

    #[Route('/signup', name: 'user.signup', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        UserRepository $userRepository
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
        $user ->setRoles(["ROLE_USER"]);
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

        // Generate a signed URL and email it to the user
        $this->emailVerifier->sendEmailConfirmation('app_verify_email', $user,
            (new TemplatedEmail())
                ->from(new Address('test@sae.com', 'Test SAE'))
                ->to((string) $user->getEmail())
                ->subject('Please Confirm your Email')
                ->htmlTemplate('registration/confirmation_email.html.twig')
        );

        // Return a success response
        return new JsonResponse(['message' => 'User registered successfully. Please verify your email.'], 201);
    }

    #[Route('/verify/email', name: 'app_verify_email')]
    public function verifyUserEmail(Request $request, UserRepository $userRepository): Response
    {
        $id = $request->query->get('id');
    
        if (null === $id) {
            return $this->redirectToRoute('app_register'); // Redirect to registration if no id
        }
    
        $user = $userRepository->find($id);
    
        if (null === $user) {
            return $this->redirectToRoute('app_register'); // Redirect to registration if user not found
        }
    
        // validate email confirmation link, sets User::isVerified=true and persists
        try {
            $this->emailVerifier->handleEmailConfirmation($request, $user);
        } catch (VerifyEmailExceptionInterface $exception) {
            $this->addFlash('verify_email_error', $exception->getReason());
    
            return $this->redirectToRoute('app_register'); // Redirect to registration if verification fails
        }
    
        // Set a flash message after successful verification
        $this->addFlash('success', 'Your email address has been verified.');
    
        // Redirect the user to the login page (the api_login route)
        return $this->redirect('http://localhost:8090/login');
    }
}
