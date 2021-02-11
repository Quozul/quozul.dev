(function() {
    const fileInput = document.getElementById('file-input');
    const logDiv = document.getElementById('log');
    const infoDiv = document.getElementById('info');
    logDiv.innerHTML = '';
    infoDiv.innerText = '';

    let dht, chart;

    const _log = console.log;

    console.log = function() {
        for (const key of arguments) {
            logDiv.innerText += key + ' ';
        }

        logDiv.innerText += '\n';
        logDiv.scrollTo(0, logDiv.scrollHeight);

        return _log.apply(console, arguments);
    };

    function buildUserList() {
        console.log('Building user list...');

        const list = document.getElementById('genders');
        list.innerHTML = '';

        Object.entries(dht.meta.users).forEach(([id, username], index) => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.innerText = username.name;

            const form = document.createElement('form');
            form.style.userSelect = 'none';
            form.innerHTML =
                `<div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="GenderOf-${id}" id="${id}-Male" value="Male" ${window.localStorage.getItem(id) === 'Male' ? 'checked' : ''}>
                    <label class="form-check-label" for="${id}-Male">Male</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="GenderOf-${id}" id="${id}-Female" value="Female" ${window.localStorage.getItem(id) === 'Female' ? 'checked' : ''}>
                    <label class="form-check-label" for="${id}-Female">Female</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="GenderOf-${id}" id="${id}-Other" value="Other" ${window.localStorage.getItem(id) === 'Other' ? 'checked' : ''}>
                    <label class="form-check-label" for="${id}-Other">Other</label>
                </div>`;
            form.id = `GenderOf-${id}`;

            form.onchange = function(event) {
                const userId = this.id.split('-')[1];
                const gender = new FormData(this).get(this.id);
                window.localStorage.setItem(userId, gender);
                dht.meta.users[userId].gender = gender;
            }

            dht.meta.users[id].gender = window.localStorage.getItem(id) || 'Unknown';

            li.append(span);
            li.append(form);
            list.append(li);
        });

        console.log('Done building user list!');
    }

    function buildChartChannelSelect() {
        const options = [{value: 'global', text: 'All channels'}];
        Object.entries(dht.meta.channels).forEach(([id, channel], index) => {
            options.push({value: id, text: channel.name});
        });
        document.getElementById('chartify-channel').innerHTML = buildSelect(options).innerHTML;
    }

    // DHT file input
    fileInput.addEventListener('change', function() {
        const file = this.files[0];

        if (file !== undefined) {
            console.log('Loading file...');
            const start = Date.now();
            workerPromise('./scripts/workerReadFile.js', file)
                .then((content) => {
                    console.log(`File loaded in ${(Date.now() - start) / 1000} seconds!`);

                    try {
                        dht = JSON.parse(content);
                    } catch (e) {
                        console.log('The file is not a valid JSON file!');
                        return;
                    }

                    if (dht === undefined || !dht.hasOwnProperty('meta') || !dht.hasOwnProperty('data')) {
                        console.log('The file is not a valid JSON file!');
                        return;
                    }

                    infoDiv.innerText = `${Object.keys(dht.meta.users).length} user(s) over ${Object.keys(dht.meta.channels).length} channel(s)`;

                    document.getElementById('analyse-btn').disabled = false;

                    buildUserList();
                    buildChartChannelSelect();
                });
        }
    });

    document.getElementById('stats-input').addEventListener('change', function() {
        const file = this.files[0];

        if (file !== undefined) {
            console.log('Loading file...');
            const start = Date.now();
            workerPromise('./scripts/workerReadFile.js', file)
                .then((content) => {
                    console.log(`File loaded in ${(Date.now() - start) / 1000} seconds!`);

                    let c;
                    try {
                        c = JSON.parse(content);
                    } catch (e) {
                        console.log('The file is not a valid JSON file!');
                        return;
                    }

                    if (c === undefined || !c.hasOwnProperty('meta') || !c.hasOwnProperty('stats')) {
                        console.log('The file is not a valid JSON file!');
                        return;
                    }

                    if (dht === undefined) {
                        dht = {meta: c.meta};
                    } else {
                        dht.meta = c.meta;
                    }

                    window.sessionStorage.setItem('stats', JSON.stringify(c.stats));

                    infoDiv.innerText = `${Object.keys(dht.meta.users).length} user(s) over ${Object.keys(dht.meta.channels).length} channel(s)`;

                    document.getElementById('export-btn').disabled = false;

                    buildUserList();
                    buildChartChannelSelect();

                    const dhstats = new DHStats.Analyse(dht);
                    window.sessionStorage.setItem('xlsx', dhstats.statsToXLSX(c.stats));

                    document.getElementById('download-btn').disabled = false;
                });
        }
    });

    document.getElementById('analyse-btn').addEventListener('click', function() {
        const dhstats = new DHStats.Analyse(dht);
        dhstats.analyse()
            .then(stats => {
                // File analysed
                window.sessionStorage.setItem('stats', JSON.stringify(stats));
                window.sessionStorage.setItem('xlsx', dhstats.statsToXLSX(stats));

                document.getElementById('download-btn').disabled = false;
                document.getElementById('export-btn').disabled = false;
            });
    });

    document.getElementById('download-btn').addEventListener('click', function() {
        download(s2ab(window.sessionStorage.getItem('xlsx')), "DHStats.xlsx", "text/plain;charset=UTF-8");
    });

    function createChart(ctx, label, data, labels, type = 'line', color = 'rgba(255, 99, 132, 1)') {
        return new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: color,
                    borderColor: color,
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }

    document.getElementById('chartify-form').addEventListener('submit', function() {
        const formData = new FormData(this);

        // Format data
        const channel = formData.get('channel');
        if (channel !== 'global') {
            const channelStats = JSON.parse(window.sessionStorage.getItem('stats')).filter((c) => c.id === channel)?.[0];

            if (channelStats !== undefined) {
                const ctx = document.getElementById('chart').getContext('2d');

                chart?.destroy();

                switch (formData.get('value')) {
                    case 'messages':
                    case 'total':
                    case 'embeds':
                    case 'total_embeds':
                        const data = channelStats.stats.map((d) => d[1][formData.get('value')]);
                        const labels = channelStats.stats.map((d) => new Date(d[0]).toLocaleDateString());
                        chart = createChart(ctx, 'Messages per day', data, labels, formData.get('view'));
                        break;
                }
            } else {
                console.log('An error occurred!');
            }
        }

        return false;
    });

    const ramUsage = document.getElementById('ram-usage');
    setInterval(() => {
        ramUsage.innerText = `Memory usage: ${(window.performance.memory.usedJSHeapSize / 1000 / 1000).toFixed(2)} MB`;
    }, 2000);

    document.getElementById('export-btn').addEventListener('click', function() {
        download(JSON.stringify({meta: dht.meta, stats: JSON.parse(window.sessionStorage.getItem('stats'))}), 'DHStats.json');
    });

    function maxHeight(id) {
        const element = document.getElementById(id);
        element.style.height = `calc(100vh - ${element.getBoundingClientRect().y}px)`;
    }

    (document.onresize = function() {
        maxHeight('genders');
    })();
})();