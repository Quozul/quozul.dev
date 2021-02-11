<!DOCTYPE html>
<html lang="en">

<?php
$page_id = 'home';
$page_name = 'Experiments - Home';
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
        <div class="d-flex align-items-stretch flex-wrap justify-content-evenly">
            <?php
            $path = $_SERVER['DOCUMENT_ROOT'] . '/experiments/';
            foreach (array_diff(scandir($path), array('..', '.')) as $key => $value) {
                $info = json_decode(file_get_contents($path . $value . '/info.json'), true);
                ?>
                <div class="card text-white bg-primary mt-3 shadow-sm" style="width: 18rem;">
                    <div class="card-header"><a href="/experiments/<?= $value ?>"
                                                class="stretched-link link-light"><?= $info['name'] ?></a></div>
                    <div class="card-body">
                        <h5 class="card-title"><?= $info['name'] ?></h5>
                        <p class="card-text"><?= $info['description'] ?></p>
                    </div>
                </div>
            <?php } ?>
        </div>
    </div>
</main>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>
</body>

</html>