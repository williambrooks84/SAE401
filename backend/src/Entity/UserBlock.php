<?php

namespace App\Entity;

use App\Repository\UserBlockRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserBlockRepository::class)]
class UserBlock
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'userBlocks')]
    private ?User $blocker = null;

    #[ORM\ManyToOne(inversedBy: 'userBlocks')]
    private ?User $blocked = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $blockedAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getBlocker(): ?User
    {
        return $this->blocker;
    }

    public function setBlocker(?User $blocker): static
    {
        $this->blocker = $blocker;

        return $this;
    }

    public function getBlocked(): ?User
    {
        return $this->blocked;
    }

    public function setBlocked(?User $blocked): static
    {
        $this->blocked = $blocked;

        return $this;
    }

    public function getBlockedAt(): ?\DateTimeImmutable
    {
        return $this->blockedAt;
    }

    public function setBlockedAt(\DateTimeImmutable $blockedAt): static
    {
        $this->blockedAt = $blockedAt;

        return $this;
    }
}
