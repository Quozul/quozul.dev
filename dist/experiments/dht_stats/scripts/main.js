// Enable Bootstrap's tooltips
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="tooltip"]'));
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});

function ObjectToCSV(head, obj) {
    let str = head + '\n';
    objectLoop(obj, (value, index, key) => {
        str += key + ';' + value + ';';
        str += '\n';
    });
    return str;
}

function download(data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        const a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

function createChart(id, obj, type = 'line') {
    return new Chart(document.getElementById(id).getContext('2d'), {
        type: type,
        data: {
            labels: Object.keys(obj),
            datasets: [{
                label: 'Messages per hours',
                data: Object.values(obj),
                backgroundColor: 'rgba(0, 99, 132, .2)',
                borderColor: 'rgba(0, 99, 132, 1)',
                borderWidth: 1,
                lineTension: 0
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            legend: {
                display: false
            },
            tooltips: {
                intersect: false
            }
        }
    });
}

function updateChart(chart, obj, type = 'line') {
    chart.data.labels = Object.keys(obj);
    chart.data.datasets[0].data = Object.values(obj);
    chart.type = type;
    chart.update()
}

function changeProgress(status = '', percentage = 0, error = false) {
    console.log(status, Math.floor(percentage))
    const progressBar = document.getElementById('file-progress');

    progressBar.style.width = Math.floor(percentage) + '%';
    progressBar.innerHTML = status;

    if (error)
        progressBar.classList.add('bg-danger');
    else
        progressBar.classList.remove('bg-danger');
}

window.charts = {};
window.stats = {};

function processFile(event) {
    const file = this.files[0];
    if (file != undefined) {
        changeProgress('', 0);

        changeProgress('Starting worker thread...', 1);
        const worker = new Worker('scripts/worker.min.js');
        worker.postMessage(file);

        worker.onmessage = function (e) {

            switch (e.data[0]) {
                case 'progress':
                    changeProgress(e.data[1], e.data[2]);
                    break;

                case 'chart':
                    if (window.charts[e.data[1]] != undefined)
                        updateChart(window.charts[e.data[1]], e.data[2], e.data[3]);
                    else
                        window.charts[e.data[1]] = createChart(e.data[1], e.data[2], e.data[3]);

                    window.stats[e.data[1]] = e.data[2];

                    break;

                case 'done':
                    document.getElementById('pills-view-tab').classList.remove('disabled');
                    document.getElementById('pills-download-tab').classList.remove('disabled');
                    break;

                default:
                    break;
            }

        }

    }
}

document.getElementById('file-input').addEventListener('change', processFile);