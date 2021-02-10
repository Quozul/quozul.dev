<?php

function openConnection(): bool|mysqli
{
    return mysqli_connect($_SERVER["HTTP_MYSQL_HOST"], $_SERVER["HTTP_MYSQL_USER"], $_SERVER["HTTP_MYSQL_PASS"], $_SERVER["HTTP_MYSQL_DB"]);
}