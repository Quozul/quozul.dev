<!DOCTYPE html>
<html lang="en">

<head>
    <title>The Secret Library Of Quozul</title>
    <meta charset="utf-8">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Quicksand:wght@400;600&display=swap" rel="stylesheet">

    <!-- Custom scripts -->
    <script src="/public/scripts/utils.js"></script>
    <script src="/public/scripts/fileIcons.js"></script>
    <script src="/public/scripts/resources.js"></script>
    <script src="/experiments/file_browser/scripts/browser.js"></script>
    <script src="/public/bootstrap/bootstrap.bundle.min.js"></script>
    <script src="/public/scripts/login.js"></script>
    <script src="/public/scripts/lib/subtitles-octopus.js"></script>

    <!-- Custom styles -->
    <link rel="stylesheet" href="/public/bootstrap/bootstrap.min.css">
    <link rel="stylesheet" href="/experiments/file_browser/styles/browser.css">
    <link rel="stylesheet" href="/public/styles/main.min.css">
    <link rel="stylesheet" href="/public/styles/resources.min.css">

    <!-- Meta tags -->
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="icon" type="image/png" href="/public/assets/icon.png">

    <meta name="description" content="My collection of publicly available files.">
    <meta name="author" content="Quozul">
    <link rel="canonical" href="https://quozul.dev/resources/">
</head>

<body class="d-flex flex-column vh-100 justify-content-between text-center">
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
                    <img src="/public/assets/icon.png" width="32" height="32" class="d-inline-block align-top" alt="" loading="lazy">
                    Quozul.dev
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target=".navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
            </div>
            <div class="navbar-collapse collapse w-100 navbarSupportedContent order-2 order-md-2">
                <ul class="navbar-nav w-100 text-center justify-content-between align-items-center">
                    <li class="nav-item m-0">
                        <a class="nav-link" href="/resources">Resources</a>
                    </li>
                    <li class="nav-item login-button">
                        <a class="nav-link d-flex align-items-center p-0" id="loginButton" href="https://discord.com/oauth2/authorize?client_id=883631190232399872&redirect_uri=https%3A%2F%2Fquozul.dev%2Fresources%2F&response_type=code&scope=identify">
                            <img src="/public/assets/Discord-Logo-White.svg" class="me-1 h-1" alt="Discord logo">
                            Login with Discord
                        </a>
                        <div id="logoutButton">
                            <span>Logout</span>
                        </div>
                    </li>
                </ul>
            </div>
        </nav>
    </div>
</header>

<main class="container">
    <div class="modal fade" id="disclaimerModal" tabindex="-1" aria-labelledby="disclaimerModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content bg-dark">
                <div class="modal-header">
                    <h5 class="modal-title" id="disclaimerModalLabel">About this page</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-start">
                    <h6 class="fw-bold">Resources available</h6>
                    <p>
                        The files made publicly available on this page comes with no warranty.
                        Some files are hidden because they are private.
                        You may use these files for your own personal use.
                    </p>

                    <h6 class="fw-bold">Resources used</h6>
                    <p>
                        File icons from <a target="_blank" rel="noopener" href="https://github.com/PKief/vscode-material-icon-theme" class="show-link">vscode-material-icon-theme</a>.
                    </p>

                    <h6 class="fw-bold">Login with Discord</h6>
                    <p>
                        While I use Discord as a mean to restrict access to some files and folders, I do not store any personal information from you.
                    </p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <file-browser></file-browser>
</main>

<footer class="container">
    <div class="mb-3 text-center p-3 container shadow-lg rounded text-white">
        © Copyright — Quozul — All rights reserved. <span class="show-link" data-bs-toggle="modal" data-bs-target="#disclaimerModal">About this page</span>.
    </div>
</footer>
</body>

</html>