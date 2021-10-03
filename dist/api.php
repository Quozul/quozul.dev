<?php
$request = $_SERVER['REQUEST_URI'];

// Remove /api/
$request = preg_replace('/^' . preg_quote('/api/', '/') . '/', '', $request);
list($before, $after) = explode('/', $request, 2);

$_SESSION['action'] = $after;

// Load .env
$env_file = file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/../.env');
$env = preg_split("/[\n\r]+/", $env_file);
foreach ($env as $item) putenv($item);

switch ($before) {
    case 'resources':
        require __DIR__ . '/api/resources/resources.php';
        break;
    case 'experiments':
        require __DIR__ . '/api/experiments.php';
        break;
    case 'download':
        require __DIR__ . '/api/resources/download.php';
        break;
    case 'login':
        require __DIR__ . '/api/login.php';
        break;
    case 'thumbnail':
        require __DIR__ . '/api/resources/thumbnail.php';
        break;
    case 'stream':
        require __DIR__ . '/api/resources/stream.php';
        break;
    case 'info':
        require __DIR__ . '/api/info.php';
        break;
    default:
        http_response_code(404);
        break;
}
