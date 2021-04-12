<?php
require_once __DIR__ . "/../../utils/database.php";

header('Content-Type:application/json');

$con = getDatabaseConnection();

$json = json_decode(file_get_contents('php://input'), true);

$id = mysqli_escape_string($con, $json['id'] ?? '');
$name = mysqli_escape_string($con, $json['name'] ?? '');
$price = mysqli_escape_string($con, $json['price'] ?? '');
$capacity = mysqli_escape_string($con, $json['capacity'] ?? '');

if (empty($id) || empty($name) || empty($price) || empty(($capacity))) {
    http_response_code(400);
    echo json_encode("All fields are required required.");
    return;
}

$res = mysqli_query($con, "update `casino`
    set `name` = '$name', `price` = '$price', `capacity` = '$capacity'
    where id_casino = $id");

echo json_encode($res);