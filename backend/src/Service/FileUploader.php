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
        $this->targetDirectory = $targetDirectory; 
        $this->slugger = $slugger;
    }

    public function upload(UploadedFile $file, string $subDirectory): string
    {
        if (!in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'image/gif'])) {
            throw new \RuntimeException('Invalid image type. Only JPEG, PNG, or GIF allowed.');
        }

        $safeFilename = $this->slugger->slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $fileName = $safeFilename . '-' . uniqid() . '.' . $file->guessExtension();

        if ($file->getSize() > 5 * 1024 * 1024) {
            throw new \RuntimeException('File size exceeds the 5MB limit.');
        }

        try {
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
