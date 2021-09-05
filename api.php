<?php
$request = $_SERVER['REQUEST_URI'];

// Remove /api/
$request = preg_replace('/^' . preg_quote('/api/', '/') . '/', '', $request);
list($before, $after) = explode('/', $request, 2);

$_SESSION['action'] = $after;

// Load .env
$env_file = file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/.env");
$env = preg_split("/[\n\r]+/", $env_file);
foreach ($env as $item) {
    putenv($item);
}

switch ($before) {
    case 'resources':
        header("Cache-Control: no-cache, max-age=0, stale-while-revalidate=300");
        require __DIR__ . '/api/resources/resources.php';
        break;
    case 'experiments':
        header("Cache-Control: private, max-age=3600");
        require __DIR__ . '/api/experiments.php';
        break;
    case 'download':
        header("Cache-Control: no-cache, max-age=0, stale-while-revalidate=300");
        require __DIR__ . '/api/resources/download.php';
        break;
    case 'login':
        require __DIR__ . '/api/login.php';
        break;
    case 'thumbnail':
        header("Cache-Control: private, max-age=3600");
        require __DIR__ . '/api/resources/thumbnail.php';
        break;
    default:
        http_response_code(404);
        break;
}
