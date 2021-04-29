<?php
$request = $_SERVER['REQUEST_URI'];

// Remove /api/
$request = preg_replace('/^' . preg_quote('/api/', '/') . '/', '', $request);
list($before, $after) = explode('/', $request, 2);

$_SESSION['action'] = $after;

header('Content-Type: application/json; charset=utf-8');

switch ($before) {
    case 'resources' :
        require __DIR__ . '/api/resources.php';
        break;
    case 'experiments' :
        require __DIR__ . '/api/experiments.php';
        break;
    case 'account' :
        require __DIR__ . '/api/account.php';
        break;
    case 'uptime' :
        $command = 'uptime | awk -F\'( |,|:)+\' \'{if ($7=="min") m=$6; else {if ($7~/^day/) {d=$6;h=$8;m=$9} else {h=$6;m=$7}}} {print "{\"days\":",d+0,",\"hours\":",h+0,",\"minutes\":",m+0,"}"}\'';
        echo shell_exec($command);
        break;
    case 'vnstats' :
        echo json_encode(json_decode(exec('vnstat --json m', $output)), JSON_PRETTY_PRINT);
        break;
    case 'stats' :
        require __DIR__ . '/api/stats.php';
        break;
    default:
        http_response_code(404);
        break;
}
