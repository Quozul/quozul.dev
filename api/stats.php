<?php

header('Content-Type: text/plain; charset=utf-8');

echo "❯ tuptime\n";

$output = null;
exec('tuptime', $output);
echo implode("\n", $output);

echo "\n\n\n❯ vnstat\n";

$output = null;
exec('vnstat', $output);
echo implode("\n", $output);

echo "\n\n\n❯ vnstat -m 100\n";

$output = null;
exec('vnstat -m 100', $output);
echo implode("\n", $output);