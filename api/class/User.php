<?php
require __DIR__ . '/Token.php';
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

        $sql = "insert into `user` (username, password) values ('$username', '$hashed_password')";

        return mysqli_query($connection, $sql);
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

        $sql = "select username, password from `user`
            where username COLLATE latin1_general_cs = '$username' and password COLLATE latin1_general_cs = '$hashed_password'";

        $request = mysqli_query($connection, $sql);

        $row = $request->fetch_assoc();

        if (is_null($row)) {
            return false;
        }

        $this->username = $username;
        $this->password = $password;

        $token = new Token();

        $token->create(
            ['alg' => 'HS256', 'typ' => 'JWT'],
            ['username' => $this->username, 'password' => $this->password, 'exp' => time() + 3600]
        );

        return $token->get();
    }
}