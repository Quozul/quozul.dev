<?php
require_once __DIR__ . "/class/Token.php";

function base64url_encode($data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data): string
{
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}

function getUserId(): ?string
{
    $id = null;
    $headers = getallheaders();

    if (isset($headers["Authorization"])) {
        $authorization = $headers["Authorization"];

        $output = [];
        preg_match("/Bearer\s((.*)\.(.*)\.(.*))/", $authorization, $output);

        // Get user's token
        $jwt = new Token();
        $jwt->import($output[1]);

        if (!$jwt->validate()) {
            return null; // Token is not valid
        }

        $id = $jwt->getPayload()["id"];
    }

    return $id;
}

function verifyParentFolders(string $path, ?string $id): bool
{
    preg_match_all("/([^\/]*)\/*/", $path, $output);
    $test_path = "";
    foreach ($output[0] as $folder) {
        $test_path .= $folder;
        $full_path = getenv("PUBLIC_FOLDER") . $test_path;

        if (is_dir($full_path) && file_exists($full_path . "/.metadata.json")) {
            $metadata = json_decode(file_get_contents($full_path . "/.metadata.json"), true);

            if (
                isset($metadata["restricted"]) && $metadata["restricted"] && // If folder is restricted in access
                (is_null($id) || array_search($id, AUTHORIZED_IDS)) // If user is allowed to view this folder
            ) {
                return false;
            }
        }
    }

    return true;
}