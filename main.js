const express = require('express');
const EasyXml = require('easyxml');
const ejs = require('ejs');
const fs = require('fs');
require('./libraries/utils');

const app = express();

const url = 'https://quozul.dev/';
const defaultPage = 'home';
const pages = ['home', 'resources', 'guess_the_color'];

// Generate site map
/*const serializer = new EasyXml({
    singularize: true,
    rootElement: 'response',
    dateFormat: 'ISO',
    manifest: true
});

let sitemap = {
    urlset: {
        _xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
        url: [],
    }
};

pages.forEach(page => {
    const stats = fs.statSync('./views/pages/' + page + '.ejs');

    sitemap.urlset.url.push({
        loc: url + page,
        lastmod: new Date(stats.mtime).format('%yyyy-%MM-%dd'),
        changefreq: 'monthly'
    });
});

fs.writeFile('./sitemap.xml', serializer.render(sitemap), function () { console.log('Updated sitemap!'); });*/

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

app.get('/:page', function (req, res, next) {
    if (req.params.page == 'sitemap.xml' || req.params.page == 'robots.txt') {
        res.sendFile(__dirname + '/' + req.params.page);
    } else {
        if (fs.existsSync(__dirname + '/views/pages/' + req.params.page + '.ejs'))
            res.locals.page = req.params.page;
        else
            res.locals.page = defaultPage;

        res.locals.pages = pages;

        res.render('index', { query: req.query, fs: fs });
    }
});

app.get('/:page/view', function (req, res, next) {
    res.render('pages/' + req.params.page, { query: req.query, fs: fs });
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
