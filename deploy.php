<?php

if (!$json = file_get_contents("php://input")) {
    http_response_code(400);
    exit();
}

if ("sha256=" . hash_hmac("sha256", $json, "SECRET") === $_SERVER["HTTP_X_HUB_SIGNATURE_256"]) {
    $tab = json_decode($json, true);

    switch ($tab["repository"]["full_name"]) {
        case "Quozul/quozul.dev":
        case "AlinaHajin/Pickaria":
        case "Team-Tipiak-ESGI/fairrepack-website":
            $repository_name = $tab["repository"]["name"];
            $default_branch = $tab["repository"]["default_branch"];

            $command = "sudo ./pull.sh $repository_name $default_branch";

            $output = [];
            $result_code = NULL;

            $res = exec($command, $output, $result_code);

            var_dump($output);

            http_response_code(200);
            break;
        default:
            http_response_code(404);
            break;
    }
} else {
    http_response_code(401);
}

exit();
