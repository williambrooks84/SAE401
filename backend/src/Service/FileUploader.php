<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;

class FileUploader
{
    private string $targetDirectory;
    private SluggerInterface $slugger;

    public function __construct(string $targetDirectory, SluggerInterface $slugger)
    {
        $this->targetDirectory = $targetDirectory;  // This should be the absolute path to the 'public/' directory
        $this->slugger = $slugger;
    }

    public function upload(UploadedFile $file, string $subDirectory): string
    {
        // Validate file MIME type
        if (!in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'image/gif'])) {
            throw new \RuntimeException('Invalid image type. Only JPEG, PNG, or GIF allowed.');
        }

        // Sanitize and create a unique filename
        $safeFilename = $this->slugger->slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $fileName = $safeFilename . '-' . uniqid() . '.' . $file->guessExtension();

        // File size check
        if ($file->getSize() > 5 * 1024 * 1024) {
            throw new \RuntimeException('File size exceeds the 5MB limit.');
        }

        // Move the file to the correct directory without altering its content
        try {
            // Correct path to move the file into 'public/assets/{subDirectory}'
            $file->move(
                $this->targetDirectory . '/public/assets/' . $subDirectory, 
                $fileName
            );
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to upload image: ' . $e->getMessage());
        }

        return $fileName;
    }

    public function getPublicDirectory(): string
    {
        return $this->targetDirectory;
    }
}
