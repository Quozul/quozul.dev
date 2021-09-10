<!DOCTYPE html>
<html lang="en">

<head>
<?php
$page_name = "Quozul's Lab - File browser";
include $_SERVER["DOCUMENT_ROOT"] . "/includes/head.php";
?>
</head>

<body class="d-flex flex-column min-vh-100 justify-content-between">
<?php include $_SERVER["DOCUMENT_ROOT"] . "/includes/header.php"; ?>

<main class="container text-center">
    <div class="col p-5">
        <h1>File browser</h1>
        <p class="text-muted">Custom file browser made in JavaScript.</p>
        <hr>
        <ul class="text-start">
            <li>
                <a href="v1/index.html" class="show-link">Version 1</a> • The first prototype
            </li>
            <li>
                <a href="v2/index.html" class="show-link">Version 2</a> • Mostly design improvements over the first version
            </li>
        </ul>
    </div>
</main>

<?php include $_SERVER["DOCUMENT_ROOT"] . "/includes/footer.php"; ?>
</body>

</html>