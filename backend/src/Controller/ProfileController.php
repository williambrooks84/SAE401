<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\FileUploader;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Psr\Log\LoggerInterface;

class ProfileController extends AbstractController
{
    private FileUploader $fileUploader;
    private EntityManagerInterface $em;
    private LoggerInterface $logger;

    public function __construct(FileUploader $fileUploader, EntityManagerInterface $em, LoggerInterface $logger)
    {
        $this->fileUploader = $fileUploader;
        $this->em = $em;
        $this->logger = $logger;
    }

    #[Route('/profile/update', name: 'profile.update', methods: ['PATCH'])]
    public function updateProfile(Request $request, ValidatorInterface $validator): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated.'], 401);
        }

        $this->logger->info('User before update:', [
            'username' => $user->getUsername(),
            'location' => $user->getLocation(),
            'bio' => $user->getBio(),
            'website' => $user->getWebsite(),
            'avatar' => $user->getAvatar(),
            'banner' => $user->getBanner(),
        ]);

        try {
            $data = array_merge(
                $request->query->all(),
                $request->toArray()
            );
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Invalid JSON in request body.'], 400);
        }
        
        if (isset($data['username'])) {
            $user->setUsername($data['username']);
        }
        if (isset($data['location'])) {
            $user->setLocation($data['location']);
        }
        if (isset($data['bio'])) {
            $user->setBio($data['bio']);
        }
        if (isset($data['website'])) {
            $user->setWebsite($data['website']);
        }

        $uploads = [
            'avatar' => 'assets/avatars/',
            'banner' => 'assets/banners/',
        ];

        foreach ($uploads as $key => $path) {
            $file = $request->files->get($key);
            if ($file) {
                try {
                    // Upload file and generate file name
                    $fileName = $this->fileUploader->upload($file, $path);
                    $setter = 'set' . ucfirst($key);
                    if (method_exists($user, $setter)) {
                        $user->$setter('/' . $path . $fileName); // Save relative URL
                    }
                } catch (\RuntimeException $e) {
                    return new JsonResponse(['error' => 'File upload failed: ' . $e->getMessage()], 500);
                }
            }
        }

        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = array_map(fn($error) => $error->getMessage(), iterator_to_array($errors));
            return new JsonResponse(['errors' => $errorMessages], 400);
        }

        if (!$this->em->contains($user)) {
            $this->logger->warning('User entity is not managed by Doctrine! Merging entity.');
            $user = $this->em->getRepository(User::class)->find($user->getId());
            if (!$user) {
                return new JsonResponse(['error' => 'User not found.'], 404);
            }
        }

        $this->logger->info('Persisting user data:', [
            'username' => $user->getUsername(),
            'location' => $user->getLocation(),
            'bio' => $user->getBio(),
            'website' => $user->getWebsite(),
            'avatar' => $user->getAvatar(),
            'banner' => $user->getBanner(),
        ]);

        $this->em->flush();

        $this->logger->info('User after flush:', [
            'username' => $user->getUsername(),
            'location' => $user->getLocation(),
            'bio' => $user->getBio(),
            'website' => $user->getWebsite(),
            'avatar' => $user->getAvatar(),
            'banner' => $user->getBanner(),
        ]);

        return new JsonResponse([
            'status' => 'success',
            'data' => [
                'username' => $user->getUsername(),
                'location' => $user->getLocation(),
                'bio' => $user->getBio(),
                'website' => $user->getWebsite(),
                'avatar' => $user->getAvatar(),
                'banner' => $user->getBanner(),
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
            $fileName = uniqid('avatar_') . '.' . $file->guessExtension();
            $file->move($this->getParameter('kernel.project_dir') . '/public/assets/avatars/', $fileName);
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
            $fileName = uniqid('banner_') . '.' . $file->guessExtension();
            $file->move($this->getParameter('kernel.project_dir') . '/public/assets/banners/', $fileName);
            $user->setBanner('/assets/banners/' . $fileName);
            $this->em->flush();
        } catch (\RuntimeException $e) {
            return new JsonResponse(['error' => 'File upload failed: ' . $e->getMessage()], 500);
        }

        return new JsonResponse(['filename' => $fileName]);
    }
}
