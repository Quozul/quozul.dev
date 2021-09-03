<!DOCTYPE html>
<html lang="en">

<?php
$page_id = 'home';
$page_name = 'The Secret Laboratory Of Quozul';
include $_SERVER['DOCUMENT_ROOT'] . '/includes/head.php';
?>

<body class="d-flex flex-column min-vh-100 justify-content-between" style="background-color: #334;">
<header class="container">
    <div class="bg-dark mt-3 rounded shadow-lg p-0">
        <?php include $_SERVER['DOCUMENT_ROOT'] . '/includes/navbar.php'; ?>
    </div>
</header>

<main class="container">
    <div class="bg-dark col mt-3 p-5 rounded shadow-lg">
        <h1>Experiments</h1>
        <p class="text-muted">Below are some random web projects I've made.</p>
        <hr>
        <div class="d-flex align-items-stretch flex-wrap justify-content-evenly" id="experiments"></div>
    </div>
</main>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>
</body>

<script src="../public/scripts/experiments.js"></script>

</html>