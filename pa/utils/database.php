<?php

/**
 * Open and returns a database connection
 * @return bool|mysqli MySQL connection
 */
function getDatabaseConnection(): bool|mysqli
{
    return mysqli_connect('localhost', 'erwan', 'mysql', 'sananight');
}
