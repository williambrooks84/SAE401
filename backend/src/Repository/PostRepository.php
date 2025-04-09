<?php

namespace App\Repository;

use App\Entity\Post;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * @extends ServiceEntityRepository<Post>
 */
class PostRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Post::class);
    }

    public function paginateAllOrderedByLatest(int $offset, int $limit): Paginator
    {
        $query = $this->createQueryBuilder('p')
            ->orderBy('p.created_at', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
        ;

        return new Paginator($query);
    }

    public function findByUsers(array $users): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.user IN (:users)')
            ->setParameter('users', $users)
            ->getQuery()
            ->getResult();
    }

    public function findById(int $id): ?Post
    {
        return $this->createQueryBuilder('p')
            ->where('p.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

}
