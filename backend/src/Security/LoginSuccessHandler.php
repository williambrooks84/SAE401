<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\SecurityBundle\Security;

class LoginSuccessHandler implements AuthenticationSuccessHandlerInterface
{
    public function __construct(private Security $security)
    {
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token): JsonResponse
    {
        $this->security->getUser();

        $accessToken = bin2hex(random_bytes(32)); 

        return new JsonResponse([
            'status' => 'success',
            'token' => $accessToken,
        ]);
    }
}
