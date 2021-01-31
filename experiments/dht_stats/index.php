<!DOCTYPE html>
<html>

    <head>
        <?php
         $page_id = 'dht';
         $page_name = 'Experiments - DHT stats';
         include $_SERVER['DOCUMENT_ROOT'] . '/includes/head.php';
        ?>
    </head>

    <body class="d-flex flex-column min-vh-100 justify-content-between" style="background-color: #334;">
        <header class="container">
            <div class="bg-dark mt-3 rounded shadow-lg p-0">
                <?php include $_SERVER['DOCUMENT_ROOT'] . '/includes/navbar.php';?>

                <div class="bg-dark p-3 border-top rounded">
                    <ul class="nav nav-pills" id="pills-tab" role="tablist">
                        <li class="nav-item" role="presentation">
                            <a class="nav-link active" id="pills-upload-tab" data-toggle="pill" href="#upload-tab" role="tab" aria-controls="upload-tab" aria-selected="true">Upload data</a>
                        </li>
                        <li class="nav-item" role="presentation">
                            <a class="nav-link disabled" id="pills-view-tab" data-toggle="pill" href="#view-tab" role="tab" aria-controls="view-tab" aria-selected="false">View data</a>
                        </li>
                        <li class="nav-item" role="presentation">
                            <a class="nav-link disabled" id="pills-download-tab" data-toggle="pill" href="#download-tab" role="tab" aria-controls="download-tab" aria-selected="false">Download CSVs</a>
                        </li>
                    </ul>
                </div>
            </div>
        </header>

        <main class="container tab-content mt-3" id="pills-tabContent">
            <div class="bg-dark col p-5 rounded shadow-lg tab-pane fade show active" id="upload-tab" role="tabpanel" aria-labelledby="pills-upload-tab">
                <div class="mb-5">
                    <h1>Why?</h1>
                    <hr>
                    <p>
                        I wanted to see how much I use Discord so I made a program to analyse a file provided by <a href="https://dht.chylex.com/" target="_blank">DHT</a>.
                    </p>
                </div>

                <div class="mt-5 mb-5">
                    <h1>Upload your data</h1>
                    <hr>
                    <h3>How to get the data?</h3>
                    <p>
                        First go to <a href="https://dht.chylex.com/" target="_blank">Discord History Tracker's</a> website.<br>
                        Choose an option and follow the steps on that website <span class="text-muted">(I recommend the "Browser Console" method)</span>.<br>
                        Save the file and upload* it on this website!
                    </p>
                </div>

                <hr>

                <div class="mt-5 mb-5">
                    <h3>Upload</h3>
                    <form>
                        <div class="form-file">
                            <input type="file" class="form-file-input" id="file-input">
                            <label class="form-file-label" for="file-input">
                                <span class="form-file-text">Choose file...</span>
                                <span class="form-file-button">Browse</span>
                            </label>
                            <small class="form-text">
                                *Your data is not uploaded to any online services, it will be analysed inside your browser.
                            </small>
                        </div>
                    </form>
                </div>

                <div class="mt-5 mb-5">
                    <label for="file-progress">Progress</label>
                    <div class="progress">
                        <div class="progress-bar progress-bar-striped" id="file-progress" role="progressbar" style="width: 0%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">Waiting for file...</div>
                    </div>
                </div>

                <div class="mt-5">
                    <h3>What next?</h3>
                    <p>
                        Once the progress of the file is done, you can check the other tabs on top of this page.
                    </p>
                </div>
            </div>

            <div class="bg-dark col p-5 rounded shadow-sm tab-pane fade" id="view-tab" role="tabpanel" aria-labelledby="pills-view-tab">
                <h1>Graphs</h1>
                <hr>
                <h3>Messages per hour</h3>
                <canvas id="messages-per-hour" style="width: 100%; height: 400px;"></canvas>
                <h3>Messages per day</h3>
                <canvas id="messages-per-day" style="width: 100%; height: 400px;"></canvas>
                <h3>Messages per channel</h3>
                <canvas id="messages-per-channel" style="width: 100%; height: 400px;"></canvas>
            </div>

            <div class="bg-dark col p-5 rounded shadow-sm tab-pane fade" id="download-tab" role="tabpanel" aria-labelledby="pills-download-tab">
                <h1>Download</h1>
                <hr>
                <div class="row">
                    <button class="btn btn-primary col m-1" type="button" onclick="download(ObjectToCSV('Hour;Messages sent;', window.stats['messages-per-hour']), this.innerHTML + '.csv')">Messages per hour</button>
                    <button class="btn btn-primary col m-1" type="button" onclick="download(ObjectToCSV('Date;Messages sent;', window.stats['messages-per-day']), this.innerHTML + '.csv')">Messages per day</button>
                    <button class="btn btn-primary col m-1" type="button" onclick="download(ObjectToCSV('Channel name;Messages sent;', window.stats['messages-per-channel']), this.innerHTML + '.csv')">Messages per channel</button>
                </div>
            </div>
        </main>

        <?php include $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php';?>
        <script src="scripts/main.min.js"></script>
    </body>

</html>