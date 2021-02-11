<?php
$request = $_SERVER['REQUEST_URI'];

// Remove /api/
$request = preg_replace('/^' . preg_quote('/api/', '/') . '/', '', $request);
list($before, $after) = explode('/', $request, 2);

$_SESSION['action'] = $after;

header('Content-Type: application/json; charset=utf-8');

switch ($before) {
    case 'resources' :
        require __DIR__ . '/api/resources.php';
        break;
    case 'account' :
        require __DIR__ . '/api/account.php';
        break;
    default:
        http_response_code(404);
        break;
}
