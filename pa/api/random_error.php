<?php
$errors = [...range(100, 103), ...range(200, 208), 210, 226, ...range(300, 308), 310, ...range(400, 418), ...range(421, 429), 431, ...range(449, 451), 456, 444, ...range(496, 511), ...range(520, 527)];

http_response_code($errors[array_rand($errors)]);
