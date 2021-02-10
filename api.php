<?php
$request = $_SERVER['REQUEST_URI'];

// Remove /api/
$request = preg_replace('/^' . preg_quote('/api/', '/') . '/', '', $request);

switch ($request) {
    case 'resources' :
        require __DIR__ . '/api/resources.php';
        break;
    default:
        http_response_code(404);
        break;
}
