<?php
require_once __DIR__ . "/../../utils/database.php";

header('Content-Type:application/json');

$con = getDatabaseConnection();

$json = json_decode(file_get_contents('php://input'), true);

$id = mysqli_escape_string($con, $json['id'] ?? '');

if (empty($id)) {
    http_response_code(400);
    echo json_encode("ID required.");
    return;
}

$res = mysqli_query($con, "delete from `casino` where id_casino = '$id'");

echo json_encode($res);