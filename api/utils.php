<?php

function openConnection(): bool|mysqli
{
    return mysqli_connect($_SERVER["HTTP_MYSQL_HOST"], $_SERVER["HTTP_MYSQL_USER"], $_SERVER["HTTP_MYSQL_PASS"], $_SERVER["HTTP_MYSQL_DB"]);
}

function base64url_encode($data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data): string
{
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}