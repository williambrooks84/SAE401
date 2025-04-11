<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Repository\TokenRepository;

#[ORM\Entity(repositoryClass: TokenRepository::class)]
class Token
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(type: 'string', unique: true)]
    private string $value;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'boolean')]
    private bool $isValid;

    public function __construct(User $user)
    {
        $this->user = $user;
        $this->value = bin2hex(random_bytes(32));
        $this->createdAt = new \DateTimeImmutable();
        $this->isValid = true;
    }

    public function getId(): ?int { return $this->id; }
    public function getUser(): ?User { return $this->user; }
    public function getValue(): string { return $this->value; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getIsValid(): bool { return $this->isValid; }
    public function setIsValid(bool $isValid): void { $this->isValid = $isValid; }

    public function setValue(string $value): void
    {
        $this->value = $value;
    }

    public function setUser(?User $user): void
    {
        $this->user = $user;
    }
}
