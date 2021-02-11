<?php
require __DIR__ . '/Token.php';
require __DIR__ . '/UUID.php';
require $_SERVER['DOCUMENT_ROOT'] . '/api/utils.php';

class User
{
    private string $username;
    private string $password;

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

    function log($id_user, $connection) {
        $useragent = mysqli_escape_string($connection, $_SERVER['HTTP_USER_AGENT']);
        $remote_address = mysqli_escape_string($connection, $_SERVER['REMOTE_ADDR']);

        $sql = "insert into `history_useragent` (useragent) values ('$useragent') ON DUPLICATE KEY UPDATE id_history_useragent = LAST_INSERT_ID(id_history_useragent)";
        mysqli_query($connection, $sql);
        $useragent_id = mysqli_insert_id($connection);

        $sql = "insert into `history_ip` (ip) values ('$remote_address') ON DUPLICATE KEY UPDATE id_history_ip = LAST_INSERT_ID(id_history_ip)";
        mysqli_query($connection, $sql);
        $address_id = mysqli_insert_id($connection);

        $sql = "insert into `history_login` (useragent, ip, user) values ($useragent_id, $address_id, '$id_user')";
        mysqli_query($connection, $sql);
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

        $this->log($row['id_user'], $connection);

        $this->username = $username;
        $this->password = $password;

        $token = new Token();

        $token->create(
            ['alg' => 'HS256', 'typ' => 'JWT'],
            ['username' => $this->username, 'password' => $this->password, 'expiry' => time() + 3600]
        );

        return $token->get();
    }
}