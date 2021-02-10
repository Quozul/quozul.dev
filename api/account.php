<?php
require __DIR__ . '/class/User.php';

switch ($_SESSION['action'])
{
    case 'create':
        $user = new User();
        $create = $user->create($_POST['username'], $_POST['password']);

        echo json_encode(["created" => $create]);
        break;

    case 'login':
        $user = new User();
        $login = $user->login($_POST['username'], $_POST['password']);

        echo json_encode(["token" => $login]);
        break;

    case 'validate':
        $authorization = getallheaders()['Authorization'];

        if (is_null($authorization)) {
            http_response_code(403);
            return;
        }

        $output = [];
        $result = preg_match("/Bearer\s((.*)\.(.*)\.(.*))/", $authorization, $output);

        $token = new Token();
        $token->import($output[1]);

        echo json_encode(["valid" => $token->validate()]);
        break;

    case 'list':
        $connection = openConnection();

        $sql = "select username from `user`";

        $request = mysqli_query($connection, $sql);

        $row = $request->fetch_all(MYSQLI_ASSOC);

        echo json_encode(json_encode($row));
        break;

    default:
        http_response_code(404);
        break;
}