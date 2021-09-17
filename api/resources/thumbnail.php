<?php
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    exit();
}

$path = rawurldecode(base64_decode($_SESSION["action"]));
$re = "/(^|[\/\\\])(\.\.[\/\\\])+/";
$dir = getenv("PUBLIC_FOLDER") . preg_replace($re, "/", $path);

// TODO: Put thumbnail for folders/files in a database
if (!file_exists($dir)) {
    http_response_code(404);
    exit;
}

$filename = null;

if (is_dir($dir)) {
    if (file_exists($dir . "/../.metadata.json")) {
        $metadata = json_decode(file_get_contents($dir . "/../.metadata.json"), true);

        if ($metadata["view_mode"] === "library") {
            $files = scandir($dir);
            $first_folder = $files[2];
            foreach ($files as $file) {
                if (!str_starts_with($file, ".") && is_dir("$dir/$file")) {
                    $first_folder = $file;
                    break;
                }
            }

            if (is_dir("$dir/$first_folder"))
                $dir = "$dir/$first_folder";
        }
    }

    if (file_exists($dir . "/.thumbnail.jpg")) {
        $filename = "/.thumbnail.jpg";
    } else if (file_exists($dir . "/.thumbnail.png")) {
        $filename = "/.thumbnail.png";
    } else {
        http_response_code(404);
        die();
    }
} else {
    $filename .= ".png";
}

$file = file_get_contents($dir . $filename);
$mime = mime_content_type($dir . $filename);

header("Content-Type: $mime");
echo $file;