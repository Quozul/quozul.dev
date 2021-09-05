<?php
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    exit();
}

// ID of authorized Discord users
define("AUTHORIZED_IDS", [getenv("DISCORD_ID")]);

//ini_set("display_errors", 1);

function recursiveDirScan(string $directory, ?string $view_mode, ?string $user_id): array
{
    $files = [];
    $dirContent = scandir($directory);

    foreach ($dirContent as $file) {
        if (substr($file, 0, 1) === ".") continue;

        $path = $directory . '/' . $file;

        if (is_dir($path)) {
            $metadata = [];
            if (file_exists($path . '/.metadata.json')) {
                $metadata = json_decode(file_get_contents($path . '/.metadata.json'), true);

                if (
                    isset($metadata["restricted"]) && $metadata["restricted"] && // If folder is restricted in access
                    (is_null($user_id) || array_search($user_id, AUTHORIZED_IDS)) // If user is allowed to view this folder
                ) continue;
            }

            $size = 0;
            $content = recursiveDirScan($path, $view_mode, $user_id);
            foreach ($content as $c) $size += $c["size"];

            $data = [
                "name" => $file,
                "dir" => true,
                "elements" => count($content),
                "size" => $size,
            ];

            if (!empty($metadata)) $data["metadata"] = $metadata;

            // Get episodes in seasons
            if ($view_mode === "library") {
                $seasons = [];
                foreach ($content as $season) {
                    if (isset($season["dir"])) $seasons[] = $season["elements"];
                }

                $data["seasons"] = $seasons;
            }

            if (file_exists($path . "/.thumbnail.jpg") || file_exists($path . "/.thumbnail.png")) $data["has_thumbnail"] = true;

            array_push($files, $data);
        } else if ($file !== '.metadata.json') {
            if ($view_mode === "library" && preg_split("/\\//", mime_content_type($path))[0] !== "video") continue;

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

header('Content-Type: application/json; charset=utf-8');

$path = $_GET["path"] ?? "/";
$re = "/(^|[\/\\\])(\.\.[\/\\\])+/";
$real_path = preg_replace($re, "/", $path);
$dir = getenv("PUBLIC_FOLDER") . $real_path;

// Get user's JWT
require_once __DIR__ . "/../utils.php";
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
$view_mode = "default";
$data = [ "path" => $real_path ];

if (file_exists($dir . '/.metadata.json')) {
    $metadata = json_decode(file_get_contents($dir . '/.metadata.json'), true);

    if (!empty($metadata)) {
        $data["metadata"] = $metadata;
        $view_mode = $metadata["view_mode"];
    }
}

$files = recursiveDirScan($dir, $view_mode, $id);

$data["content"] = $files;

echo json_encode($data);