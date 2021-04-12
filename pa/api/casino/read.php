<?php
require_once __DIR__ . "/../../utils/database.php";

// Response header
header('Content-Type:application/json');

// Open connection
$con = getDatabaseConnection();

// Start writing SQL request
$sql = "select * from `casino`";

// Get limit and offset
$limit = mysqli_escape_string($con, intval($_GET['size'] ?? 10));
$offset = mysqli_escape_string($con, intval($_GET['page'] ?? 0) * $limit);

// Remove page and limit to not use them as filters
unset($_GET['size']);
unset($_GET['page']);

// Where condition for filters
if (!empty($_GET)) {
    $sql .= " where";

    $iter = new CachingIterator(new ArrayIterator($_GET));

    foreach ($iter as $key => $value) {
        $value = mysqli_escape_string($con, $value);
        $key = mysqli_escape_string($con, $key);
        $sql .= " `$key` like '%$value%'";

        if ($iter->hasNext()) $sql .= " and";
    }
}

// Add limit and offset
$sql .= " limit $limit offset $offset";

// Make request
$res = mysqli_query($con, $sql);

// If request is a success
if (!$res) {
    http_response_code(400); // Return 400 because it's always the user's mistake :upside_down:
    die();
}

// Else return result
echo json_encode(mysqli_fetch_all($res, MYSQLI_ASSOC));