const path = require("path");
const {isMainThread, Worker, workerData} = require('worker_threads');
const logger = require("./logger");
const cheerio = require("cheerio");
const _ = require("lodash");
const moment = require("moment");
const workerPath = path.join(__dirname, "parse.worker.js");
const workerRetrivePath = path.join(__dirname, "parseRetrive.worker.js");
let limit = 20;

let parseData = [];
let uberAlert = [];

setInterval(v => {
    let datas = [];
    let sortData = [...parseData];
    sortData = _.sortBy(sortData, 'id').reverse();
    _.map(sortData, (v) => {
        datas.push([v.id, v.title, v.content, v.date, v.url])
    })

    electronWindow.webContents.executeJavaScript(`refreshDataTable('${JSON.stringify(datas).replaceAll("'", "\\'").replaceAll('"','\\"')}')`).catch(e => {
        console.log("refresh Error", e)
    })
    electronWindow.webContents.executeJavaScript(`refreshUberAlert('${JSON.stringify(uberAlert).replaceAll("'", "\\'").replaceAll('"','\\"')}')`).catch(e => {
        console.log("refresh Error", e)
    })

    electronWindow.setTitle(`카오스큐브 레더 릴레이 현황 ${moment().format("A hh:mm:ss").replace("PM", "오후").replace("AM","오전")}`)
}, 1000)

if (isMainThread) {
    let worker = new Worker(workerPath);
    let workerRetrive = new Worker(workerRetrivePath);
    worker.on("message", function (data) {
        switch (data.type) {
            case 0:
                let $ = cheerio.load(data.data);
                let trElements = $('tbody').eq(10).find("tr");
                let sendData = [];
                for (let i = 9; i < trElements.length; i++) {
                    if (sendData.length >= 10) {
                        break
                    }
                    let tr = $(trElements[i]);
                    if (tr.children().length <= 1) {
                        continue
                    }
                    let titleElement = $(tr).find("td").eq(2).find("a");
                    let id = $(tr).find("td").eq('0').text().trim().trim();

                    let url = titleElement.attr("href")
                    if (url !== undefined) {
                        url = url.trim();
                    } else {
                        continue
                    }
                    let title = titleElement.text().trim();
                    sendData.push({
                        id   : id,
                        url  : url,
                        title: title
                    })
                }

                workerRetrive.postMessage({
                    type: 1,
                    data: sendData
                })
                break;
            case 1:

                uberAlert = data.data;
                break;
        }
    })
    workerRetrive.on('message', function (data) {
        switch (data.type) {
            case 2:
                _.map(data.data, v => {
                    if (_.findIndex(parseData, {id: v.id}) < 0) {
                        parseData.unshift(v);
                    }
                })
                if (parseData.length >= limit) {
                    parseData = parseData.slice(0, 15);
                }
                break;
        }
    })
    worker.on('exit', function (v) {
        logger.error(`${v} 이유료 종료됨`);
    })
}


