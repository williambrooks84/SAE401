<?php

/* indique où "vit" ce fichier */
namespace App\Controller;

use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;

/* le nom de la classe doit TOUJOURS être cohérent avec le nom du fichier */
class TestController
{
    /*
       La méthode que l'on veut exécuter en remplacement de la page
       par défaut de Symfony. Le nom de la méthode importe peu.
    */
    #[Route('/', name: 'home')]
    public function home()
    {
        // Return a minimal HTML page as a string
        $htmlContent = "
            <!DOCTYPE html>
            <html lang='en'>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <title>Test Page</title>
            </head>
            <body>
                <h1>Welcome to My Symfony Application</h1>
                <p>This is a minimal HTML page returned from Symfony.</p>
            </body>
            </html>
        ";

        // Create a new Response object with HTML content
        return new Response($htmlContent, Response::HTTP_OK, ['Content-Type' => 'text/html']);
    }
}