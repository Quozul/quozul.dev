<?php
require_once __DIR__ . "/../../utils/database.php";

header('Content-Type:application/json');

$con = getDatabaseConnection();

$json = json_decode(file_get_contents('php://input'), true);

$name = mysqli_escape_string($con, $json['name'] ?? '');
$price = mysqli_escape_string($con, $json['price'] ?? '');
$capacity = mysqli_escape_string($con, $json['capacity'] ?? '');

if (empty($name) || empty($price) || empty(($capacity))) {
    http_response_code(400);
    echo json_encode("All fields are required required.");
    return;
}

$res = mysqli_query($con, "insert into `casino` (name, price, capacity)
    values ('$name', '$price', '$capacity')");

if ($res) {
    http_response_code(201);
    echo json_encode(mysqli_insert_id($con));
} else {
    http_response_code(400);
    echo json_encode("Bad request");
}

