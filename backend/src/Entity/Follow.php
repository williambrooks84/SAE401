<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
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

    public function getFollower(): User
    {
        return $this->follower;
    }

    public function setFollower(User $follower): self
    {
        $this->follower = $follower;
        return $this;
    }

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
