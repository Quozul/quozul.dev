<?php
// The goal of this file is to verify that the user is logged in using Discord
$code = file_get_contents("php://input");

if (empty($code)) {
    http_response_code(400);
    exit;
}

/**
 * @throws Exception
 */
function request($url, $headers = [], $post = null): string
{
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

    if (300 <= $http_code) {
        throw new Exception($body);
    }

    return $body;
}

/**
 * @throws Exception
 */
function token($code) {
    $url = "https://discord.com/api/oauth2/token";

    $data = http_build_query([
        "client_id" => getenv("CLIENT_ID"),
        "client_secret" => getenv("CLIENT_SECRET"),
        "code" => $code,
        "grant_type" => "authorization_code",
        "redirect_uri" => "https://quozul.dev/resources",
    ]);

    $body = request($url, ["Content-type: application/x-www-form-urlencoded"], $data);

    return json_decode($body, true);
}

/**
 * @throws Exception
 */
function info($access_token) {
    $url = "https://discord.com/api/users/@me";

    $body = request($url, ["Authorization: Bearer " . $access_token]);

    return json_decode($body, true);
}

header("Content-Type: application/json");

try {
    $discord_token = token($code);
} catch (Exception $e) {
    exit();
}

$access_token = $discord_token["access_token"];
try {
    $discord_info = info($access_token);
} catch (Exception $e) {
    exit();
}

require_once __DIR__ . "/class/Token.php";
$expiry = time() + $discord_token["expires_in"];
$jwt = new Token();
$jwt->create(
    ["alg" => "HS256", "typ" => "JWT"],
    ["username" => $discord_info["username"], "id" => $discord_info["id"], "expiry" => $expiry]
);

$discord_info["token"] = $jwt->get();
$discord_info["expiry"] = $expiry;

header('Content-Type: application/json; charset=utf-8');
echo json_encode($discord_info);