<?php
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    exit();
}

ini_set("display_errors", 1);

$path = $_GET["path"] ?? "/";
$re = "/(^|[\/\\\])(\.\.[\/\\\])+/";
$real_path = preg_replace($re, "/", $path);
$real_path = getenv("PUBLIC_FOLDER") . $real_path;

if (!file_exists($real_path)) {
    echo '"Video file not found"';
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

// TODO: Encrypt the video file

$slash = strrpos($real_path, "/");
$directory_path = substr($real_path, 0, $slash);
$video_name = substr($real_path, $slash + 1, strlen($real_path) - $slash);

$dash_path = substr($real_path, 0, strrpos($real_path, "."));
$video_name = substr($dash_path, $slash + 1, strlen($dash_path) - $slash);

$video_path = $dash_path . "_dashinit.mp4";
$mpd_path = $dash_path . "_dash.mpd";

if (isset($_SERVER["HTTP_RANGE"])) {
    if (!file_exists($video_path)) {
        echo '"Dash file not found"';
        http_response_code(404);
        exit();
    }

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

    $filename = fopen($video_path, "rb");

    fseek($filename, intval($start));
    http_response_code(206);

    set_time_limit(0);
    echo fread($filename, $length);
    ob_flush();
    flush();
    fclose($filename);
} else {
    // Read MPD file
    if (!file_exists($mpd_path)) {
        echo '"MPD file not found"';
        http_response_code(404);
        exit();
    }

    header("Content-Type: application/json");

    // Format the XML and return it as JSON
    $xml = simplexml_load_file($mpd_path);
    $xml->registerXPathNamespace("x", "urn:mpeg:dash:schema:mpd:2011");
    $representations = $xml->xpath("//x:Period/x:AdaptationSet/x:Representation");

    $response = [
        "lang" => [],
        "mpd" => [],
    ];
    $content = scandir($directory_path);

    foreach ($content as $filename) {
        if (str_ends_with($filename, ".ass")) {
            list($v, $l) = preg_split("/\\./", $filename, 3);
            if ($v === $video_name) {
                $response["lang"][] = $l;
            }
        }
    }

    foreach ($representations as $r) {
        $r->registerXPathNamespace("x", "urn:mpeg:dash:schema:mpd:2011");
        $init = $r->xpath("//x:SegmentList/x:Initialization")[0];
        $segmentsList = $r->xpath("//x:SegmentList")[0];
        $segments = $r->xpath("//x:SegmentList/x:SegmentURL");

        $segs = [];
        foreach ($segments as $seg) {
            list($start, $end) = explode("-", (string) $seg["mediaRange"], 2);
            $segs[] = [intval($start), intval($end)];
        }

        list($start, $end) = explode("-", (string) $init["range"], 2);

        $response["mpd"][] = [
            "id" => (int) $r["id"],
            "mime" => (string) $r["mimeType"][0],
            "codecs" => (string) $r["codecs"][0],
            "width" => (int) $r["width"][0],
            "height" => (int) $r["height"][0],
            "framerate" => (string) $r["frameRate"][0],
            "bandwidth" => (int) $r["bandwidth"][0],
            "duration" => (int) $segmentsList["duration"][0],
            "timescale" => (int) $segmentsList["timescale"][0],
            "init" => [intval($start), intval($end)],
            "segments" => $segs,
        ];
    }

    echo json_encode($response);
}