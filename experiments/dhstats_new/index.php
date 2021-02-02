<!DOCTYPE html>
<html lang="en">

<head>
    <title>Experiments - DHStats</title>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/bootstrap/bootstrap.min.css">
    <script src="/bootstrap/bootstrap.bundle.min.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="icon" type="image/png" href="/assets/icon.png">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.3/Chart.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css?family=Quicksand&display=swap');

        * {
            font-family: 'Quicksand', sans-serif;
        }

        .copyleft {
            display: inline-block;
            transform: rotate(180deg);
        }

        .copyleft::after {
            content: "\00a9";
        }

        .bg-dark {
            background-color: #343a40!important;
            color: white;
        }
    </style>
</head>

<body class="d-flex flex-column min-vh-100 justify-content-between" style="background-color: #334;">
<header class="container">
    <div class="bg-dark mt-3 rounded shadow-lg p-0">
        <?php include $_SERVER['DOCUMENT_ROOT'] . '/includes/navbar.php';?>
    </div>
</header>

<main class="container tab-content mt-3" id="pills-tabContent">
    <div class="row m-0 bg-dark p-5">
        <div class="col-8 p-2">
            <!-- File loading -->

            <form>
                <div class="mb-3">
                    <label for="file-input" class="form-label">Load DHT file</label>
                    <input class="form-control" type="file" id="file-input">
                </div>


                <div class="mb-3">
                    <label for="stats-input" class="form-label">Load statistics file</label>
                    <input class="form-control" type="file" id="stats-input">
                </div>

                <button type="button" class="btn btn-primary" id="analyse-btn" disabled>Analyse file</button>
                <button type="button" class="btn btn-primary" id="download-btn" disabled>Download XLSX</button>
                <button type="button" class="btn btn-primary" id="export-btn" disabled>Export stats</button>
            </form>

            <!-- Verbose -->

            <hr>

            <div id="ram-usage">Memory usage: 0 MB</div>
            <div id="info">&nbsp;</div>
            <b>Logs:</b>
            <pre id="log" class="bg-secondary rounded p-2" style="overflow-y: scroll; height: 256px;"></pre>

            <!-- Chart -->

            <hr>

            <div class="alert alert-info alert-dismissible fade show" role="alert">
                <h4 class="alert-heading">Work in progress!</h4>
                <p>The following section of the page is still work in progress. Not all the features are working.</p>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>

            <form id="chartify-form" onsubmit="return false;">
                <div class="mb-3">
                    <label for="chartify-channel">Channel</label>
                    <select id="chartify-channel" name="channel" class="form-select">
                        <option>Please load a file first</option>
                    </select>
                </div>

                <div class="mb-3">
                    <label for="chartify-value">Value</label>
                    <select id="chartify-value" name="value"  class="form-select">
                        <optgroup label="Message statistics">
                            <option value="messages">Messages</option>
                            <option value="total">Total messages</option>
                            <option value="embeds">Embeds</option>
                            <option value="total_embeds">Total embeds</option>
                        </optgroup>
                        <optgroup label="Other statistics">
                            <option value="userStats">Messages per user</option>
                            <option value="words">Words</option>
                            <option value="hours">Hours</option>
                        </optgroup>
                    </select>
                </div>

                <div class="mb-3">
                    <label for="chartify-view">View</label>
                    <select id="chartify-view" name="view"  class="form-select">
                        <option value="line">Line</option>
                        <option value="bar">Bar</option>
                        <option value="pie">Pie</option>
                    </select>
                </div>

                <button type="submit" class="btn btn-primary" id="chartify-btn">Chartify!</button>
            </form>

            <canvas id="chart"></canvas>

            <!--<form id="chartify-range">
                <input type="range" class="form-range" name="slider" id="chartify-range-slider" value="0" min="0" max="0">
                <input type="number" class="form-range" name="size" id="chartify-range-size" value="0" min="0" max="0">
            </form>-->
        </div>

        <div class="col-4 p-2">
            <div><h1>No data is being sent to the server!</h1>
                <b>Instructions</b>
                <ol>
                    <li>Choose a file</li>
                    <li>(Optional) Select genders of the users</li>
                    <li>Analyse the file</li>
                    <li>Download the excel file or chartify!</li>
                </ol>
                <b>Analysing speeds (283.704 messages over 95 channels)</b>
                <ol>
                    <li>Xiaomi Mi A2 lite: took <13 seconds</li>
                    <li>Ryzen 5 1600x: took <1 second</li>
                    <li>Ryzen 9 5950x: took <.5 second</li>
                </ol>
            </div>

            <!-- User list -->
            <b>User genders</b>
            <p class="text-muted">This is an optionnal step.</p>
            <ul id="genders" class="list-group" style="overflow-y: scroll;"></ul>
        </div>
    </div>
</main>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php';?>
<!-- Scripts -->
<script src="scripts/utils.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.min.js" integrity="sha512-d9xgZrVZpmmQlfonhQUvTR7lMPtO7NkZMkA0ABN3PHCbKA5nqylQ/yWlFAyY6hYgdF1Qh6nYiuADWwKB4C2WSw==" crossorigin="anonymous"></script>

<script src="scripts/dist/171.js"></script>
<script src="scripts/dist/main.js"></script>
<script src="scripts/dist/WorkerWeb.worker.js"></script>

<script src="scripts/main.js"></script>
</body>

</html>