const express = require('express');
const EasyXml = require('easyxml');
const fs = require('fs');
const yazl = require('yazl');
const prettyBytes = require('pretty-bytes');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');
const mysql = require('mysql');
const utils = require('./libraries/utils');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'quozul.dev'
});

connection.connect();

const app = express();

const url = 'https://quozul.dev/';
const defaultPage = 'home';
const pages = ['home', 'resources', 'guess_the_color'];

app.set('view engine', 'ejs');

function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}

const m = (v) => v != undefined ? `'${escapeHtml(v)}'` : null;

app.use(function (req, res, next) {
    const ip = req.headers['x-forwarded-for'];
    const location = geoip.lookup(ip);

    const ua = UAParser(req.headers["user-agent"]);
    const time = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const url = req.url;

    connection.query(`insert into visits (date, ip, page, country, city, browser_name, browser_version, os_name, os_version) values (${m(time)}, ${m(ip)}, ${m(url)}, ${m(location != null ? location.country : null)}, ${m(location != null ? location.city : null)}, ${m(ua.browser.name)}, ${m(ua.browser.version)}, ${m(ua.os.name)}, ${m(ua.os.version)});`, function (error, results, fields) {
        if (error) throw error;
    });
    next();
});

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
    if (fs.existsSync('../downloads/' + req.params[0]))
        res.download('../downloads/' + req.params[0]);
    else {
        res.locals.pages = pages;
        res.render('404', { query: req.query });
    }
});

app.get('/statistics/:stats', function (req, res, next) {
    switch (req.params.stats) {
        case 'countries':
            connection.query(`select country as data, count(*) as count from (select country from visits group by date) as t group by country order by count desc;`, (err, r) => res.send(r));
            break;

        case 'hours':
            connection.query(`select hour as data, count(*) as count from (select extract(HOUR from date) as hour from visits group by date) as t group by hour order by hour;`, (err, r) => res.send(r));
            break;

        case 'resources':
            connection.query(`select page as data, count(*) as count from (select page from visits group by date) as t group by page order by count desc;`, (err, r) => res.send(r));
            break;

        case 'browsers':
            connection.query(`select browser as data, count(*) as count from (select browser_name as browser from visits group by date) as t group by browser order by count desc;`, (err, r) => res.send(r));
            break;

        case 'os':
            connection.query(`select os as data, count(*) as count from (select concat(os_name, ' ', os_version) as os from visits group by date) as t group by os order by count desc;`, (err, r) => res.send(r));
            break;

        default:
            break;
    }
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

        res.render('index', { query: req.query, fs: fs, prettyBytes: prettyBytes, connection: connection });
    }
});

app.get('/:page/view', function (req, res, next) {
    res.render('pages/' + req.params.page, { query: req.query, fs: fs, prettyBytes: prettyBytes, connection: connection });
});

app.get('/:folder/:file', function (req, res, next) {
    const folder = req.params.folder;
    const file = req.params.file;

    if (folder != 'scripts' && folder != 'assets' && folder != 'styles')
        res.redirect('/');

    res.sendFile(`${__dirname}/public/${folder}/${file}`);
});

app.listen(8081, function () {
    console.log('Example app listening on port 8081!');
});
