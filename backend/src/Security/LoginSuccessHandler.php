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
        // Get the authenticated user (optional, can be used if needed)
        $this->security->getUser();

        // For example, generate an access token (you can replace this with your token generation logic)
        $accessToken = bin2hex(random_bytes(32));  // You can use a more secure method for generating tokens

        // Return a JSON response with the token
        return new JsonResponse([
            'status' => 'success',
            'token' => $accessToken,  // Send the generated token to the client
        ]);
    }
}
