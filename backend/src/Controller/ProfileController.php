<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\FileUploader;
use App\Service\ProfileService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ProfileController extends AbstractController
{
    private ProfileService $profileService;
    private FileUploader $fileUploader;
    private EntityManagerInterface $em;

    public function __construct(ProfileService $profileService, FileUploader $fileUploader, EntityManagerInterface $em)
    {
        $this->profileService = $profileService;
        $this->fileUploader = $fileUploader;
        $this->em = $em;
    }

    #[Route('/profile/update', name: 'profile.update', methods: ['PATCH'])]
    public function updateProfile(Request $request, ValidatorInterface $validator): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
    
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated.'], 401);
        }
    
        // Update text fields
        $fields = ['username', 'location', 'bio', 'website'];
        foreach ($fields as $field) {
            if ($value = $request->get($field)) {
                $setter = 'set' . ucfirst($field);
                $user->$setter($value);
            }
        }
    
        // Handle file uploads (avatar & banner)
        $uploads = [
            'avatar' => 'assets/avatars/',
            'banner' => 'assets/banners/',
        ];
        
        foreach ($uploads as $key => $path) {
            $file = $request->files->get($key);
            if ($file) {
                try {
                    $fileName = $this->fileUploader->upload($file, $path);
                    $setter = 'set' . ucfirst($key);
                    $user->$setter('/' . $path . $fileName); // Save full path to the user entity
                } catch (\RuntimeException $e) {
                    return new JsonResponse(['error' => 'File upload failed: ' . $e->getMessage()], 500);
                }
            }
        }
    
        // Validate the user data
        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = array_map(fn($error) => $error->getMessage(), iterator_to_array($errors));
            return new JsonResponse(['errors' => $errorMessages], 400);
        }
    
        // Persist the updated user entity
        $this->em->flush();
    
        // Return the updated user profile data
        return new JsonResponse([
            'status' => 'success',
            'data' => [
                'username' => $user->getUsername(),
                'location' => $user->getLocation(),
                'bio' => $user->getBio(),
                'website' => $user->getWebsite(),
                'avatar' => $user->getAvatar(),  // This should be the relative path
                'banner' => $user->getBanner(),  // This should be the relative path
            ]
        ]);
    }

    #[Route('/upload-avatar', name: 'profile.avatar', methods: ['POST'])]
    public function uploadAvatar(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $file = $request->files->get('file');
        if (!$file) {
            return new JsonResponse(['error' => 'No file uploaded.'], 400);
        }

        try {
            // Generate a unique filename for the image
            $fileName = uniqid('avatar_') . '.' . $file->guessExtension();

            // Get the absolute path to the public directory
            $publicDirectory = $this->getParameter('kernel.project_dir') . '/public/assets/avatars/';

            // Move the uploaded file to the correct directory
            $file->move($publicDirectory, $fileName);

            // Update the user's avatar URL
            $user->setAvatar('/assets/avatars/' . $fileName);
            $this->em->flush();
        } catch (\RuntimeException $e) {
            return new JsonResponse(['error' => 'File upload failed: ' . $e->getMessage()], 500);
        }

        return new JsonResponse(['filename' => $fileName]);
    }

    #[Route('/upload-banner', name: 'profile.banner', methods: ['POST'])]
    public function uploadBanner(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $file = $request->files->get('file');
        if (!$file) {
            return new JsonResponse(['error' => 'No file uploaded.'], 400);
        }

        try {
            // Generate a unique filename for the banner
            $fileName = uniqid('banner_') . '.' . $file->guessExtension();

            // Get the absolute path to the public directory
            $publicDirectory = $this->getParameter('kernel.project_dir') . '/public/assets/banners/';

            // Move the uploaded file to the correct directory
            $file->move($publicDirectory, $fileName);

            // Update the user's banner URL
            $user->setBanner('/assets/banners/' . $fileName);
            $this->em->flush();
        } catch (\RuntimeException $e) {
            return new JsonResponse(['error' => 'File upload failed: ' . $e->getMessage()], 500);
        }

        return new JsonResponse(['filename' => $fileName]);
    }
}
