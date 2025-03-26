<?php

namespace App\Security;

use App\Repository\TokenRepository;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\HttpFoundation\Request;


class AccessTokenHandler implements AccessTokenHandlerInterface
{
    public function __construct(
        private TokenRepository $repository
    ) {
    }

    public function getUserBadgeFrom(string $accessToken): UserBadge
    {
        // Find the token from the repository
        $accessToken = $this->repository->findOneByValue($accessToken);
        
        if (null === $accessToken || !$accessToken->getIsValid()) {
            throw new BadCredentialsException('Invalid credentials.');
        }

        // Return a UserBadge object containing the user identifier (e.g., user ID or email)
        return new UserBadge($accessToken->getUser()->getEmail());
    }

    /**
     * This method is called to check if the request contains an access token.
     *
     * @param Request $request
     * @return bool|null
     */
    public function supports(Request $request): ?bool
    {
         // Exclude the /posts route from token handling
         if ($request->getPathInfo() === '/posts') {
              return false;
         }

         return $request->headers->has('Authorization') || $request->query->has('token');
    }
}
