<?php
function recursiveDirScan(string $directory): array
{
    $files = [];

    $dirContent = scandir($directory);

    foreach ($dirContent as $key => $file) {
        if (substr($file, 0, 1) === '.') continue;

        $path = $directory . '/' . $file;

        if (is_dir($path)) {
            $metadata = json_decode(file_get_contents($path . '/.metadata.json'));

            $content = recursiveDirScan($path);
            $size = 0;
            foreach ($content as $c) $size += $c["size"];

            array_unshift($files, [
                "path" => $file,
                "dir" => $content,
                "metadata" => $metadata,
                "size" => $size,
            ]);
        } else if ($file !== 'metadata.json') {
            $size = filesize($path);
            $time = filemtime($path);

            array_push($files, [
                "path" => $file,
                "size" => $size,
                "time" => $time,
            ]);
        }
    }

    return $files;
}

header("Content-type:application/json");

if (PHP_OS === "WINNT")
    $dir = $_SERVER['DOCUMENT_ROOT'];
else
    $dir = "/home/erwan/public";

$files = recursiveDirScan($dir);

echo json_encode([[
    'path' => '',
    'dir' => $files,
]]);
