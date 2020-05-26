const express = require('express');
const EasyXml = require('easyxml');
const fs = require('fs');
const yazl = require('yazl');
const prettyBytes = require('pretty-bytes');
const utils = require('./libraries/utils');

const app = express();

const url = 'https://quozul.dev/';
const defaultPage = 'home';
const pages = ['home', 'resources', 'guess_the_color'];

app.set('view engine', 'ejs');

app.get('/', function (req, res, next) {
    res.locals.page = defaultPage;
    res.locals.pages = pages;

    res.render('index', { query: req.query, fs: fs });
});

app.get('/header', function (req, res, next) {
    res.locals.pages = pages;
    res.locals.page = req.query.page;
    res.render('includes/header');
});

// Temporary
app.get('/cours/*', function (req, res, next) {
    res.sendFile(__dirname + '/cours/' + req.params[0]);
});

app.get('/download/*', function (req, res, next) {
    res.download('../downloads/' + req.params[0]);
});

app.get('/folder/*', function (req, res, next) {
    const zipfile = new yazl.ZipFile();
    const directory = '../downloads/' + req.params[0];

    utils.recursive_dir_scan(directory).forEach(file => {
        const path = file.path + '/' + file.name;
        zipfile.addFile(path, path.substr(directory.length + 1, path.length));
    });

    zipfile.outputStream.pipe(res);
    zipfile.end();
});

app.get('/:page', function (req, res, next) {
    if (req.params.page == 'sitemap.xml' || req.params.page == 'robots.txt') {
        res.sendFile(__dirname + '/' + req.params.page);
    } else {
        if (fs.existsSync(__dirname + '/views/pages/' + req.params.page + '.ejs'))
            res.locals.page = req.params.page;
        else
            res.locals.page = defaultPage;

        res.locals.pages = pages;

        res.render('index', { query: req.query, fs: fs, prettyBytes: prettyBytes });
    }
});

app.get('/:page/view', function (req, res, next) {
    res.render('pages/' + req.params.page, { query: req.query, fs: fs, prettyBytes: prettyBytes });
});

app.get('/:folder/:file', function (req, res, next) {
    const folder = req.params.folder;
    const file = req.params.file;

    if (folder != 'scripts' && folder != 'assets' && folder != 'styles')
        res.redirect('/');

    res.sendFile(`${__dirname}/public/${folder}/${file}`)
});

app.listen(8081, function () {
    console.log('Example app listening on port 8081!');
});
