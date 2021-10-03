<!DOCTYPE html>
<html lang="en">

<head>
<?php
$page_name = "The Secret Laboratory Of Quozul";
include $_SERVER["DOCUMENT_ROOT"] . "/../includes/head.php";
?>
</head>

<body class="d-flex flex-column min-vh-100 justify-content-between">
<?php include $_SERVER["DOCUMENT_ROOT"] . "/../includes/header.php"; ?>

<main class="container text-center">
    <div class="col p-5">
        <h1>Experiments</h1>
        <p class="text-muted">
            Below are some random web projects I've made.<br>
            <strong>Disclaimer!</strong> Some older experiments (before september 2021) might not work anymore.
        </p>
        <hr>
        <div class="text-start d-flex align-items-stretch flex-wrap justify-content-evenly" id="experiments"></div>
    </div>
</main>

<?php include $_SERVER["DOCUMENT_ROOT"] . "/../includes/footer.php"; ?>
</body>

<script src="/public/scripts/experiments.js"></script>

</html>