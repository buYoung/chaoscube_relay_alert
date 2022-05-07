// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
let table;
$(document).ready(function () {
    table = $('#chaoscube').DataTable({
        data        : [],
        order       : false,
        searching   : false,
        lengthChange: false,
        info        : false,
        pageLength  : 20,
        paging      : false,
        length      : 20,
        columnDefs  : [
            {"width": "0%", "targets": 0},
            {"width": "30%", "targets": 1},
            {"width": "50%", "targets": 2},
            {"width": "20%", "targets": 3},
            {"width": "0%", "targets": 4, visible: false},
        ],
        columns     : [
            {title: "id"},
            {
                title: "제목", render: (data, i, row, meta) => {

                    return `<a class="decoRemove" onclick="openWindow('${row.url}')">${data}</a>`;
                }
            },
            {
                title: "내용", render: (data, i, row, meta) => {
                    return `<a class="decoRemove" onclick="openWindow('${row.url}')">${data}</a>`;
                }
            },
            {
                title: "날짜", render: (data, i, row, meta) => {
                    let date = moment(data.replace("오후", "PM").replace("오전", "AM"), 'YYYY-MM-DD A hh:mm:ss');
                    let now = moment(moment(), 'YYYY-MM-DD A hh:mm:ss');
                    return `${moment.duration(now.diff(date)).asSeconds().toFixed(0)}초 전에 생성됨`;
                }
            },
            {title: "url"},
        ]
    });
});

function openWindow(url) {
    const remote = require('electron').remote;
    const BrowserWindow = remote.BrowserWindow;
    const win = new BrowserWindow({
        height: 600,
        width: 800
    });

    win.loadURL('<url>');
}

function refreshDataTable(data) {
    table.clear().draw();
    let dataArray = JSON.parse(data);
    table.rows.add(dataArray).draw();
}

function refreshUberAlert(data) {
    let dataArray = JSON.parse(data);
    for (let i = 0; i < dataArray.length; i++) {
        $(`#progress${i + 1}*`).text(dataArray[i].progress);
        $(`#server${i + 1}*`).text(dataArray[i].server);
        $(`#mod${i + 1}*`).text(dataArray[i].mod);
        $(`#date${i + 1}*`).text(dataArray[i].date);
    }
}

