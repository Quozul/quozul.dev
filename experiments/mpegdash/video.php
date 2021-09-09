<?php
// Load .env
$env_file = file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/.env");
$env = preg_split("/[\n\r]+/", $env_file);
foreach ($env as $item) putenv($item);

// TODO: Add user authentication
// TODO: Encrypt the video file

if (isset($_SERVER["HTTP_RANGE"])) {
    $video_path = getenv("PUBLIC_FOLDER") . "/test/out_dashinit.mp4";
    $size = filesize($video_path);
    $mime = mime_content_type($video_path);

    list($start, $end) = explode("-", $_SERVER["HTTP_RANGE"], 2);

    header("Content-Range: bytes $start-$end/$size");
    header("Accept-Ranges: bytes");
    header("Content-Type: $mime");

    // TODO: Should only accept the ranges present in the MPD file
    if (0 > $start || $end > $size) {
        http_response_code(416); // Requested Range Not Satisfiable
        exit();
    }

    $length = intval($end) - intval($start) + 1;
    header("Content-Length: " . $length);

    $file = fopen($video_path, "rb");

    fseek($file, intval($start));
    http_response_code(206);

    set_time_limit(0);
    echo fread($file, $length);
    ob_flush();
    flush();
    fclose($file);
} else {
    // Read MPD file
    $mpd_path = getenv("PUBLIC_FOLDER") . "/test/out_dash.mpd";

    header("Content-Type: application/dash+xml");

    $xml = simplexml_load_file($mpd_path);
    // TODO: Process the xml before sending it
    echo json_encode($xml);
}