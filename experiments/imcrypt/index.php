<!DOCTYPE html>
<html>

    <head>
        <?php
         $page_id = 'imcrypt';
         $page_name = 'Experiments - ImCrypt';
         include $_SERVER['DOCUMENT_ROOT'] . '/includes/head.php';
        ?>
    </head>

    <body class="d-flex flex-column min-vh-100 justify-content-between" style="background-color: #334;">
        <header class="container">
            <div class="bg-dark mt-3 rounded shadow-lg p-0">
                <?php include $_SERVER['DOCUMENT_ROOT'] . '/includes/navbar.php';?>
            </div>
        </header>

        <main class="container mt-3" id="pills-tabContent">
            <div class="d-flex flex-column justify-content-">
                <div class="bg-dark shadow-lg p-5 rounded row m-0">
                    <div class="col">
                        <h1>Instructions</h1>
                        <hr>
                        <p>
                            <ol>
                                <li>Upload a file in the encrypt section.</li>
                                <li>Download the image.</li>
                                <li>Upload the image in the decrypt section.</li>
                                <li>Your original file is downloaded.</li>
                            </ol>
                        </p>
                    </div>

                    <div class="col">
                        <h1>Requirements</h1>
                        <hr>
                        <p>
                            Your browser may crash due to high memory usage. I recommend only trying this with small files. If you want to go higher, try the <a href="https://github.com/Quozul/imcrypt/releases/latest" target="_blank">binary version in C</a> which is also much faster.
                        </p>
                    </div>
                </div>

                <div class="bg-dark p-5 shadow-lg rounded row m-0 mt-3">
                    <div class="col">
                        <h1>Encrypt a file</h1>
                        <hr>

                        <form>
                            <div class="form-file">
                                <input type="file" class="form-file-input" id="encrypt-input">
                                <label class="form-file-label shadow-sm cursor-pointer" for="encrypt-input">
                                    <span class="form-file-text">Choose file...</span>
                                    <span class="form-file-button">Browse</span>
                                </label>
                                <small class="form-text">
                                    *Your files are not uploaded to any online services, they will be processed inside your browser.
                                </small>
                            </div>
                        </form>

                        <div class="mt-5 mb-5">
                            <label for="encrypt-progress">Progress</label>
                            <div class="progress shadow-sm">
                                <div class="progress-bar progress-bar-striped" id="encrypt-progress" role="progressbar" style="width: 0%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">Waiting for file...</div>
                            </div>
                        </div>

                        <canvas id="encrypt-canvas" class="d-none"></canvas>
                        <button class="btn btn-primary w-100 d-none" id="download-image">Download image</button>

                    </div>

                    <div class="col">
                        <h1>Decrypt a file</h1>
                        <hr>

                        <form>
                            <div class="form-file">
                                <input type="file" class="form-file-input" id="decrypt-input">
                                <label class="form-file-label shadow-sm" for="decrypt-input">
                                    <span class="form-file-text">Choose file...</span>
                                    <span class="form-file-button">Browse</span>
                                </label>
                                <small class="form-text">
                                    *Your files are not uploaded to any online services, they will be processed inside your browser.
                                </small>
                            </div>
                        </form>

                        <div class="mt-5 mb-5">
                            <label for="decrypt-progress">Progress</label>
                            <div class="progress shadow-sm">
                                <div class="progress-bar progress-bar-striped" id="decrypt-progress" role="progressbar" style="width: 0%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">Waiting for file...</div>
                            </div>
                        </div>

                        <button class="btn btn-primary w-100 d-none" id="download-file">Download file</button>

                        <canvas id="decrypt-canvas" class="d-none"></canvas>

                    </div>
                </div>
            </div>
        </main>

        <?php include $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php';?>
        <script src="scripts/main.min.js"></script>
    </body>

</html>