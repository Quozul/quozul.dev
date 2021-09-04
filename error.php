<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">

    <!-- Import fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Quicksand:wght@400;600&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="/public/bootstrap/bootstrap.min.css">

    <!-- Custom scripts -->
    <script src="/experiments/page_scroll/page.js"></script>
    <script src="/public/scripts/main.js"></script>

    <!-- Custom styles -->
    <link rel="stylesheet" href="/public/styles/main.min.css">
    <link rel="stylesheet" href="/experiments/page_scroll/page.min.css">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="https://quozul.dev/public/assets/icon.png">

    <link rel="canonical" href="https://quozul.dev/">

    <!-- Primary Meta Tags -->
    <title>Woops</title>
    <meta name="description" content="Hi, I'm a full stack web developer. I'm still in high school for now but here's my website. Come check it out!">
    <meta name="robots" content="noindex, nofollow">
</head>

<body class="d-flex flex-column min-vh-100 justify-content-between">
<header class="container">
    <div class="mt-3 p-0">
        <nav class="navbar navbar-expand-lg navbar-dark">
            <div class="navbar-collapse collapse w-100 navbarSupportedContent order-1 order-md-0">
                <ul class="navbar-nav ms-auto text-center">
                    <li class="nav-item active">
                        <a class="nav-link" href="/experiments">Experiments</a>
                    </li>
                </ul>
            </div>
            <div class="mx-auto my-2 order-0 order-md-1 position-relative">
                <a class="navbar-brand mx-2" href="/">
                    <img src="/public/assets/icon.png" width="30" height="30" class="d-inline-block align-top" alt="" loading="lazy">
                    Quozul.dev
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target=".navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
            </div>
            <div class="navbar-collapse collapse w-100 navbarSupportedContent order-2 order-md-2">
                <ul class="navbar-nav me-auto text-center">
                    <li class="nav-item">
                        <a class="nav-link" href="/resources">Resources</a>
                    </li>
                </ul>
            </div>
        </nav>
    </div>
</header>

<main class="container">
    <section class="page page-current">
        <div class="text-white text-center">
            <?php
            $code = $_GET["code"];
            $msg = "Woops";
            if (500 <= $code && $code < 600) {
                $msg = "Act as if you had saw nothing";
            } else if ($code == 404) {
                $msg = "You seem to have lost yourself";
            } else if ($code == 403) {
                $msg = "This is a secret place";
            } else if ($code == 401) {
                $msg = "You do not belong here";
            }
            ?>
            <h1><?php echo $code ?></h1>
            <h2 class="mt-0"><?php echo $msg ?></h2>
            <a class="show-link" href="/">Go back to home page</a>
        </div>
    </section>
</main>

<footer class="container">
    <div class="mt-3 mb-3 text-center p-3 container text-white">
        © Copyright — Quozul — All rights reserved.
    </div>
</footer>

</body>

</html>