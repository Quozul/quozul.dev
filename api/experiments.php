<?php

$url_base = '/experiments/';
$path = $_SERVER['DOCUMENT_ROOT'] . $url_base;
$experiments = [];

foreach (array_diff(scandir($path), array('..', '.')) as $key => $value) {
    if (!is_dir($path . $value)) continue;
    $experiment = json_decode(file_get_contents($path . $value . '/info.json'), true);
    $experiment["url"] = $url_base . $value;
    $experiments[] = $experiment;
}

echo json_encode($experiments);