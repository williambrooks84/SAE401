<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: 'App\Repository\FollowRepository')]
class Follow
{
    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: 'App\Entity\User')]
    #[ORM\JoinColumn(nullable: false)]
    private User $follower;

    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: 'App\Entity\User')]
    #[ORM\JoinColumn(nullable: false)]
    private User $followed;

    // Getter and setter for follower
    public function getFollower(): User
    {
        return $this->follower;
    }

    public function setFollower(User $follower): self
    {
        $this->follower = $follower;
        return $this;
    }

    // Getter and setter for followed
    public function getFollowed(): User
    {
        return $this->followed;
    }

    public function setFollowed(User $followed): self
    {
        $this->followed = $followed;
        return $this;
    }

}
