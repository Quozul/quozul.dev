<?php

ini_set("display_errors", 1);
$request = $_SERVER['REQUEST_URI'];
$request = preg_replace('/^' . preg_quote('/e/', '/') . '/', '', $request);
$folder = $_SERVER["DOCUMENT_ROOT"] . "/experiments";

$closest = null;
$experiments = array_diff(scandir($folder), array('..', '.'));

function longestMatch($a, $b): int {
    $matching_chars = 0;
    $shortest_length = min(strlen($a), strlen($b));

    for ($i = 0; $i < $shortest_length; $i++) { 
        if ($a[$i] === $b[$i])
            $matching_chars++;
        else
            break;
    }

    return $matching_chars;
}

foreach ($experiments as $key => $value) {
    $a = longestMatch($request, $closest);
    $b = longestMatch($value, $request);

    $cond = false;

    if ($a === $b)
        $cond = strcmp($request, $closest) < strcmp($value, $request);
    else
        $cond = $a < $b;

    if ($closest === null || $cond)
        $closest = $value;
}

header("Location: /experimentsexperiments/$closest");