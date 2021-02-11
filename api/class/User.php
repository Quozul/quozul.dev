<?php
require_once __DIR__ . '/Token.php';
require_once __DIR__ . '/UUID.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/api/utils.php';

class User
{
    /**
     * Create a new user in the database
     * @param $username
     * @param $password
     * @return bool
     */
    function create($username, $password): bool
    {
        if (strlen($username) < 2 && strlen($password) < 1) return false;

        $connection = openConnection();
        $hashed_password = hash('sha256', $password);
        $username = mysqli_escape_string($connection, $username);

        $uuid = (new UUID())->v4(openssl_random_pseudo_bytes(16));

        $sql = "insert into `user` (id_user, username, password) values ('$uuid', '$username', '$hashed_password')";

        return mysqli_query($connection, $sql);
    }

    /**
     * Insert a record in the database to log user connections or account creation
     * @param $id_user
     * @param null|string $date
     */
    function log($id_user, $date = null) {
        $date = $date ?? date("Y-m-d H:i:s");

        $connection = openConnection();

        $useragent = mysqli_escape_string($connection, $_SERVER['HTTP_USER_AGENT']);
        $remote_address = mysqli_escape_string($connection, $_SERVER['REMOTE_ADDR']);

        $sql = "insert into `history_useragent` (useragent) values ('$useragent') ON DUPLICATE KEY UPDATE id_history_useragent = LAST_INSERT_ID(id_history_useragent)";
        mysqli_query($connection, $sql);
        $useragent_id = mysqli_insert_id($connection);

        $sql = "insert into `history_ip` (ip) values ('$remote_address') ON DUPLICATE KEY UPDATE id_history_ip = LAST_INSERT_ID(id_history_ip)";
        mysqli_query($connection, $sql);
        $address_id = mysqli_insert_id($connection);

        $sql = "insert into `history_login` (useragent, ip, user, date) values ($useragent_id, $address_id, '$id_user', '$date')";
        mysqli_query($connection, $sql);
    }

    /**
     * Check if a user exists
     * @param $username
     * @return bool
     */
    function exists($username): bool
    {
        $connection = openConnection();

        $username = mysqli_escape_string($connection, $username);

        $sql = "select username from `user`
            where username COLLATE latin1_general_cs = '$username'";

        $request = mysqli_query($connection, $sql);

        $row = $request->fetch_assoc();

        if (is_null($row)) {
            return false;
        }
    }

    /**
     * Generate a new JWT
     * @param $username
     * @param $password
     * @return string|bool
     */
    function login($username, $password): string|bool
    {
        $connection = openConnection();

        $hashed_password = hash('sha256', $password);
        $username = mysqli_escape_string($connection, $username);

        $sql = "select id_user, username, password from `user`
            where username COLLATE latin1_general_cs = '$username' and password COLLATE latin1_general_cs = '$hashed_password'";

        $request = mysqli_query($connection, $sql);

        $row = $request->fetch_assoc();

        if (is_null($row)) {
            return false;
        }

        $this->log($row['id_user']);

        $token = new Token();

        $token->create(
            ['alg' => 'HS256', 'typ' => 'JWT'],
            ['username' => $username, 'password' => $password, 'expiry' => time() + 3600]
        );

        return $token->get();
    }
}