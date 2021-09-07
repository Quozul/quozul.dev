<?php
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

require_once __DIR__ . "/../utils.php";
$id = getUserId();

// Verify user is authorized to download file
if (!verifyParentFolders($path, $id)) {
    http_response_code(401);
    exit();
}

$mime = mime_content_type($real_path);
$length = $size = filesize($real_path);

$path = $real_path;
$fp = @fopen($path, "rb");
$length = $size; // Content length
$start = 0; // Start byte
$end = $size - 1; // End byte
header("Content-type: " . $mime);
header("Accept-Ranges: bytes");

if (isset($_SERVER["HTTP_RANGE"])) {
    $c_start = $start;
    $c_end = $end;
    list(, $range) = explode("=", $_SERVER["HTTP_RANGE"], 2);

    if (str_contains($range, ",")) {
        http_response_code(416); // Requested Range Not Satisfiable
        header("Content-Range: bytes $start-$end/$size");
        exit;
    }

    if ($range == "-") {
        $c_start = $size - substr($range, 1);
    } else {
        $range = explode("-", $range);
        $c_start = $range[0];
        $c_end = (isset($range[1]) && is_numeric($range[1])) ? $range[1] : $size;
    }
    $c_end = ($c_end > $end) ? $end : $c_end;
    if ($c_start > $c_end || $c_start > $size - 1 || $c_end >= $size) {
        http_response_code(416); // Requested Range Not Satisfiable
        header("Content-Range: bytes $start-$end/$size");
        exit;
    }

    $start = $c_start;
    $end = $c_end;
    $length = $end - $start + 1;
    fseek($fp, $start);
    http_response_code(206); // Partial Content
}

header("Content-Range: bytes $start-$end/$size");
header("Content-Length: " . $length);
$buffer = 1024 * 8;

while (!feof($fp) && ($p = ftell($fp)) <= $end) {
    if ($p + $buffer > $end) {
        $buffer = $end - $p + 1;
    }
    set_time_limit(0);
    echo fread($fp, $buffer);
    ob_flush();
    flush();
}

fclose($fp);
exit();