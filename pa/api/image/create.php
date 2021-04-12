<?php

$image = file_get_contents('php://input');
header('Content-Type: image/jfif');
echo $image;

$path = $_SERVER['DOCUMENT_ROOT'] . '/uploads';
if (!file_exists($path)) {
    mkdir($path, 0777, true);
}

$filepath = $path . '/file';

file_put_contents($filepath, $image);

/*
$accept = [
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/png',
    'image/jfif'
];
if (is_null($_FILES['image'])) {
    echo 'Please upload a file named "image".';
    exit();
}

// verify the file type
if (!in_array($_FILES['image']['type'], $accept)) {
    echo 'Incorrect file type.';
    exit();
}

// limit image size to 1 MB
$maxsize = 1024 * 1024;
if ($_FILES['image']['size'] > $maxsize) {
    echo 'File size above limit.';
    exit();
}

// Save file
$path = $_SERVER['DOCUMENT_ROOT'] . '/uploads';
if (!file_exists($path)) {
    mkdir($path, 0777, true);
}

$filepath = $path . '/' . $filename;
move_uploaded_file($_FILES['image']['tmp_name'], $filepath);

header('Content-Type: ' . $_FILES['avatar']['type']);

$fileContent = file_get_contents($_FILES['image']['tmp_name']);

echo($fileContent);
*/