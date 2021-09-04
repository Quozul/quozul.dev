<?php
// ID of authorized Discord users
define("AUTHORIZED_IDS", [getenv("DISCORD_ID")]);

ini_set("display_errors", 1);

function recursiveDirScan(string $directory, ?string $id): array
{
    $files = [];

    $dirContent = scandir($directory);

    foreach ($dirContent as $file) {
        if (substr($file, 0, 1) === '.') continue;

        $path = $directory . '/' . $file;

        if (is_dir($path)) {
            $metadata = [];
            if (file_exists($path . '/.metadata.json')) {
                $metadata = json_decode(file_get_contents($path . '/.metadata.json'), true);

                if (
                    isset($metadata["restricted"]) && $metadata["restricted"] && // If folder is restricted in access
                    (is_null($id) || array_search($id, AUTHORIZED_IDS)) // If user is allowed to view this folder
                ) continue;
            }

            $content = recursiveDirScan($path, $id);
            $size = 0;
            foreach ($content as $c) $size += $c["size"];

            array_unshift($files, [
                "name" => $file,
                "content" => $content,
                "metadata" => $metadata,
                "size" => $size,
            ]);
        } else if ($file !== '.metadata.json') {
            $size = filesize($path);
            $time = filemtime($path);

            array_push($files, [
                "name" => $file,
                "size" => $size,
                "time" => $time,
            ]);
        }
    }

    return $files;
}

header("Content-Type: application/json");

$path = $_GET["path"] ?? "/";
$re = "/(^|[\/\\\])(\.\.[\/\\\])+/";
$real_path = preg_replace($re, "/", $path);

if (PHP_OS === "WINNT")
    $dir = $_SERVER['DOCUMENT_ROOT'];
else
    $dir = getenv("PUBLIC_FOLDER") . $real_path;

// Get user's JWT
require_once __DIR__ . "/utils.php";
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

$files = recursiveDirScan($dir, $id);

echo json_encode([
    "path" => $real_path,
    "content" => $files,
]);
