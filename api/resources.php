<?php
function recursiveDirScan(string $directory): array
{
    $files = [];

    $dirContent = scandir($directory);

    foreach ($dirContent as $key => $file) {
        if (substr($file, 0, 1) === '.') continue;

        $path = $directory . '/' . $file;

        if (is_dir($path)) {
            array_unshift($files, [
                'path' => $file,
                'dir' => recursiveDirScan($path)
            ]);
        } else {
            $size = filesize($path);
            $time = filemtime($path);

            array_push($files, [
                'path' => $file,
                'size' => $size,
                'time' => $time
            ]);
        }
    }

    return $files;
}

header("Content-type:application/json");
$dir = $_SERVER['DOCUMENT_ROOT'];
//$dir = "C:\\Users\\erwan\\Documents\\projects\\ts\\Genetic Algorithm";

echo json_encode([[
    'path' => '',
    'dir' => recursiveDirScan($dir),
]]);
