<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Doctrine\ORM\EntityManagerInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[UniqueEntity(fields: ['email'], message: 'There is already an account with this email')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'json')]
    private array $roles = [];

    #[ORM\Column(length: 20)]
    private ?string $username = null;

    #[ORM\Column(length: 255)]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    #[ORM\Column(type: "boolean")]
    private ?bool $isVerified = false;

    /**
     * @var Collection<int, Token>
     */
    #[ORM\OneToMany(targetEntity: Token::class, mappedBy: 'user')]
    private Collection $value;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $banner = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $avatar = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $location = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $bio = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $website = null;

    #[ORM\OneToMany(mappedBy: 'follower', targetEntity: 'App\Entity\Follow', cascade: ['persist'])]
    private Collection $followers;

    #[ORM\OneToMany(mappedBy: 'followed', targetEntity: 'App\Entity\Follow', cascade: ['persist'])]
    private Collection $following;

    /**
     * @var Collection<int, UserBlock>
     */
    #[ORM\OneToMany(targetEntity: UserBlock::class, mappedBy: 'blocker')]
    private Collection $userBlocks;

    public function __construct()
    {
        $this->value = new ArrayCollection();
        $this->followers = new ArrayCollection();
        $this->following = new ArrayCollection();
        $this->userBlocks = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function getRoles(): array
    {
        return $this->roles;
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    public function getUsername(): string
    {
        return $this->username; 
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * This method is required by Symfony to get the unique user identifier (e.g. email or username).
     */
    public function getUserIdentifier(): string
    {
        return $this->email; // Use email as the unique identifier for your user
    }

    public function getSalt(): ?string
    {
        // Return null if you're using bcrypt or argon2
        return null;
    }

    public function eraseCredentials(): void
    {
        // You can clear sensitive data if you store anything like plain text passwords here.
    }

    /**
     * @return Collection<int, Token>
     */
    public function getValue(): Collection
    {
        return $this->value;
    }

    public function addValue(Token $value): static
    {
        if (!$this->value->contains($value)) {
            $this->value->add($value);
            $value->setUser($this);
        }

        return $this;
    }

    public function removeValue(Token $value): static
    {
        if ($this->value->removeElement($value)) {
            // set the owning side to null (unless already changed)
            if ($value->getUser() === $this) {
                $value->setUser(null);
            }
        }

        return $this;
    }

    public function getIsVerified(): ?bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(bool $isVerified): static
    {
        $this->isVerified = $isVerified;
        return $this;
    }

    public function isVerified(): bool
    {
        return $this->isVerified;
    }

    public function getBanner(): ?string
    {
        return $this->banner;
    }

    public function setBanner(?string $banner): static
    {
        $this->banner = $banner;

        return $this;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function setAvatar(?string $avatar): static
    {
        $this->avatar = $avatar;

        return $this;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(?string $location): static
    {
        $this->location = $location;

        return $this;
    }

    public function getBio(): ?string
    {
        return $this->bio;
    }

    public function setBio(?string $bio): static
    {
        $this->bio = $bio;

        return $this;
    }

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function setWebsite(?string $website): static
    {
        $this->website = $website;

        return $this;
    }

    public function getFollowers(): Collection
    {
        return $this->followers;
    }

    public function getFollowing(): Collection
    {
        return $this->following;
    }

    public function follow(User $user, EntityManagerInterface $entityManager): void
    {
        if (!$this->isFollowing($user)) {
            $follow = new Follow();
            $follow->setFollower($this);
            $follow->setFollowed($user);

            $this->following->add($follow);
            $user->followers->add($follow);
            
            $entityManager->persist($follow);
        }
    }

    public function isFollowing(User $user): bool
    {
        foreach ($this->following as $follow) {
            if ($follow->getFollowed() === $user) {
                return true;
            }
        }
        return false;
    }

    /**
     * @return Collection<int, UserBlock>
     */
    public function getUserBlocks(): Collection
    {
        return $this->userBlocks;
    }

    public function addUserBlock(UserBlock $userBlock): static
    {
        if (!$this->userBlocks->contains($userBlock)) {
            $this->userBlocks->add($userBlock);
            $userBlock->setBlocker($this);
        }

        return $this;
    }

    public function removeUserBlock(UserBlock $userBlock): static
    {
        if ($this->userBlocks->removeElement($userBlock)) {
            // set the owning side to null (unless already changed)
            if ($userBlock->getBlocker() === $this) {
                $userBlock->setBlocker(null);
            }
        }

        return $this;
    }

}
