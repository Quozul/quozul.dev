<?php
require_once __DIR__ . "/../utils/database.php";

header('Content-Type:application/json');

$con = getDatabaseConnection();

$res = mysqli_query($con, "select * from casino");

echo json_encode(mysqli_fetch_all($res, MYSQLI_ASSOC));