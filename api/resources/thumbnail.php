<?php
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    exit();
}

$path = rawurldecode(base64_decode($_SESSION["action"]));
$re = "/(^|[\/\\\])(\.\.[\/\\\])+/";
$dir = getenv("PUBLIC_FOLDER") . preg_replace($re, "/", $path);

$filename = "/.thumbnail.jpg";

if (file_exists($dir . "/.thumbnail.jpg")) {
    $filename = "/.thumbnail.jpg";
} else if (file_exists($dir . "/.thumbnail.png")) {
    $filename = "/.thumbnail.png";
} else {
    http_response_code(404);
    var_dump($dir);
    die();
}

$file = file_get_contents($dir . $filename);
$mime = mime_content_type($dir . $filename);

header("Content-Type: $mime");
echo $file;