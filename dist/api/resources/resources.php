<?php
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    exit();
}

//ini_set('display_errors', true);

function parseMetadata(string $path): array
{
    if (file_exists($path . '/.metadata.json')) {
        return json_decode(file_get_contents($path . '/.metadata.json'), true);
    }

    return [];
}

function recursiveDirScan(string $directory, ?string $user_id, ?string $viewMode = 'default'): array
{
    $files = [];
    $dirContent = scandir($directory);

    foreach ($dirContent as $file) {
        if (str_starts_with($file, '.')) continue;

        $path = $directory . '/' . $file;

        $size = filesize($path);
        $time = filemtime($path);

        $data = [
            'name' => $file,
            'size' => $size,
            'time' => $time,
            'hasThumbnail' => false,
        ];

        // TODO: Put metadata for folders in database
        if (is_dir($path)) {
            $metadata = parseMetadata($path);

            if (
                isset($metadata['restricted']) && $metadata['restricted'] && // If folder is restricted in access
                (is_null($user_id) || array_search($user_id, AUTHORIZED_IDS)) // If user is allowed to view this folder
            ) continue;

            $data['metadata'] = $metadata;

            $size = 0;
            $content = recursiveDirScan($path, $user_id, $viewMode);
            foreach ($content as $c) $size += $c['size'];

            $data['dir'] = true;
            $data['elements'] = count($content);
            $data['size'] = $size;

            // Get episodes in seasons
            switch ($viewMode) {
                case 'library': {
                    $seasons = [];
                    foreach ($content as $season) {
                        if (isset($season['dir'])) {
                            $seasons[] = $season['elements'];
                        }
                    }

                    $data['seasons'] = $seasons;
                    break;
                }
            }

            $thumbnailPath = $path . '/' . $content[0]['name'];
            if (file_exists($path . '/.thumbnail.jpg') || file_exists($path . '/.thumbnail.png')) {
                $data['hasThumbnail'] = true;
            } else if (file_exists($thumbnailPath . '/.thumbnail.jpg') || file_exists($thumbnailPath . '/.thumbnail.png')) {
                $data['hasThumbnail'] = true;
            }

        } else if ($file !== '.metadata.json') {
            $mime = mime_content_type($path);
            if ($viewMode !== 'default' && (!$mime || explode('/', $mime, 1)[0] !== 'video')) continue;
        }

        array_push($files, $data);
    }

    return $files;
}

header('Content-Type: application/json; charset=utf-8');

$path = $_GET['path'] ?? '/';
$re = '/(^|[\/\\\])(\.\.[\/\\\])+/';
$real_path = preg_replace($re, '/', $path);
$dir = getenv('PUBLIC_FOLDER') . $real_path;

// Get user's JWT
require_once __DIR__ . '/../utils.php';
$id = getUserId();

if (!file_exists($dir)) {
    http_response_code(404);
    exit();
}

if (!is_dir($dir)) {
    http_response_code(400);
    exit();
}

if (!verifyParentFolders($path, $id)) {
    http_response_code(401);
    exit();
}

$metadata = null;
$viewMode = 'default';
$data = [ 'path' => $real_path ];

if (file_exists($dir . '/.metadata.json')) {
    $metadata = json_decode(file_get_contents($dir . '/.metadata.json'), true);

    if (!empty($metadata)) {
        $data['metadata'] = $metadata;
        if (isset($metadata['viewMode'])) {
            $viewMode = $metadata['viewMode'];
        }
    }
}

$files = recursiveDirScan($dir, $id, $viewMode);
usort($files, function ($a, $b) {
    return isset($b['dir']) && !isset($a['dir']);
});
$data['content'] = $files;

echo json_encode($data);
