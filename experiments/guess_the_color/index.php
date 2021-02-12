<!DOCTYPE html>
<html lang="en-US">

    <head>
        <?php
         $page_id = 'imcrypt';
         $page_name = 'Experiments - Guess the color game';
         include $_SERVER['DOCUMENT_ROOT'] . '/includes/head.php';
        ?>
        <link href="styles/game.min.css" rel="stylesheet" type="text/css">
        <script src="scripts/ntc.min.js"></script>
        <script src="scripts/main.min.js"></script>
    </head>

    <body class="d-flex flex-column min-vh-100 justify-content-between" style="background-color: #334;">
        <header class="container">
            <div class="bg-dark mt-3 rounded shadow-lg p-0">
                <?php include $_SERVER['DOCUMENT_ROOT'] . '/includes/navbar.php';?>
            </div>
        </header>

        <main class="container mt-3">
            <div class="rounded bg-dark p-5 shadow-lg text-center">
                <noscript>
                    <h3><i>Guess the color game</i> requires JavaScript in order to work.</h3>
                    <p>Please enable JavaScript in your browser settings to play the game.</p>
                </noscript>

                <div id="js-enabled" style="display: none">
                    <div class="row">
                        <h1 id="guess">Guess the color</h1>
                        <h3 id="last-color">&nbsp;</h3>
                    </div>
                    <div class="row">
                        <div class="col">
                            rgb<span id="color-code">(<span class="red">0</span>, <span class="green">0</span>, <span class="blue">0</span>)</span>
                        </div>
                        <div class="col">
                            <span id="diff-span">Difficulty: <span id="difficulty">0</span>
                            </span>

                            <span id="reset" class="gtc-tooltip toggle-tooltip gtc-tooltip-clickable">
                                <span class="gtc-tooltip-text">Reset progress</span>
                                <span class="gtc-tooltip"><span id="reseted" class="gtc-tooltip-text">Reseted!</span>
                                    <span id="reset-arrow">↻</span>
                                </span>
                            </span>

                            <br>
                            <span>
                                Win rate: <span id="win-rate">??%</span>
                            </span>
                        </div>
                    </div>

                    <div id="colors" class="row d-flex justify-content-around my-3">
                        <span class="color-circle">&nbsp;</span>
                        <span class="color-circle">&nbsp;</span>
                        <span class="color-circle">&nbsp;</span>
                        <span class="color-circle">&nbsp;</span>
                        <span class="color-circle">&nbsp;</span>
                    </div>

                    <small>
                        By playing the game, you allow the website to store a cookie on your computer (used for saving your game progression).
                    </small>
                </div>
            </div>
        </main>

        <?php include $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php';?>

        <script>
        init();
        </script>
    </body>

</html>