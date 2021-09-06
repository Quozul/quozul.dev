<?php
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    exit();
}

define("AUTHORIZED_IDS", [getenv("DISCORD_ID")]);

$path = $_GET["path"] ?? "/";
$re = "/(^|[\/\\\])(\.\.[\/\\\])+/";
$real_path = preg_replace($re, "/", $path);
$real_path = getenv("PUBLIC_FOLDER") . $real_path;

if (!file_exists($real_path)) {
    http_response_code(404);
    exit;
}

if (is_dir($real_path)) {
    http_response_code(400);
    exit;
}

if (preg_split("/\\//", mime_content_type($real_path))[0] === "video") {
    http_response_code(303);
    exit;
}

require_once __DIR__ . "/../utils.php";
$id = getUserId();

// Verify user is authorized to download file
if (!verifyParentFolders($path, $id)) {
    http_response_code(401);
    exit();
}

// the file name of the download, change this if needed
$public_name = basename($path);

// get the file's mime type to send the correct content type header
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime_type = finfo_file($finfo, $real_path);

// send the headers
header("Content-Disposition: attachment; filename=$public_name;");
header("Content-Type: $mime_type");
header("Content-Length: " . filesize($real_path));

// stream the file
$fp = fopen($real_path, 'rb');
fpassthru($fp);
exit;