<?php
// The goal of this file is to verify that the user is logged in using Discord
$code = file_get_contents("php://input");

if (empty($code)) {
    http_response_code(400);
    exit;
}

function request($url, $headers = [], $post = null) {
    $ch = curl_init($url);

    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    if (!is_null($post)) {
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
    }

    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);

    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    http_response_code($http_code);

    $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $body = substr($response, $header_size);

    curl_close($ch);

    return $body;
}

function token($code) {
    $url = "https://discord.com/api/oauth2/token";

    $data = http_build_query([
        "client_id" => getenv("CLIENT_ID"),
        "client_secret" => getenv("CLIENT_SECRET"),
        "code" => $code,
        "grant_type" => "authorization_code",
        "redirect_uri" => "https://quozul.dev/login",
    ]);

    $body = request($url, ["Content-type: application/x-www-form-urlencoded"], $data);

    return json_decode($body, true);
}

function info($access_token) {
    $url = "https://discord.com/api/users/@me";

    $body = request($url, ["Authorization: Bearer " . $access_token]);

    return json_decode($body, true);
}

header("Content-Type: application/json");

$tok = token($code);
$access_token = $tok["access_token"];
echo json_encode(array_merge($tok, info($access_token)));