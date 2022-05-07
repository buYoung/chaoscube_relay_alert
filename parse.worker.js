const axios = require("axios");
const iconv = require('iconv-lite')
const {parentPort, isMainThread} = require("worker_threads")
const logger = require("./logger")
const cheerio = require('cheerio')
const {data} = require("cheerio/lib/api/attributes");
const defaultRelayUrl = 'https://board.chaoscube.co.kr/trade/board/list.asp?t_name=';
const defaultUberAlert = 'https://www.chaoscube.co.kr/uber/';
const relayType = {
    standard: "trade_gl_stanbus3",
    ladder  : "trade_gl_ladderbus3",
}
let isRelayType = "ladder";
const headers = {
    'Content-type'   : 'application/x-www-form-urlencoded; charset=UTF-8',
    'accept'         : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
    'user-agent'     : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'

}
if (!isMainThread) {
    parentPort.on('message', function (data) {
        switch (data.type) {
            case 0:
                isRelayType = data.data;
                break;
        }
    })

    setInterval(async () => {
        await Promise.all([getChaosCubeRelayBoard(), getChaosCubeRelayUberdia()])
    }, 10000)

    async function getChaosCubeRelayBoard() {
        let url = defaultRelayUrl;
        url += relayType[isRelayType]
        try {
            const response = await axios.get(url, {headers: {...headers}, responseType: "arraybuffer"});
            parentPort.postMessage({type: 0, data: iconv.decode(response.data, "EUC-KR").toString()});
        } catch (e) {
            logger.error("요청오류", e)
        }
    }

    async function getChaosCubeRelayUberdia() {
        let url = defaultUberAlert;
        try {
            const response = await axios.get(url, {headers: {...headers}, responseType: "arraybuffer"});
            let responseData = iconv.decode(response.data, "EUC-KR").toString();
            let $ = cheerio.load(responseData);
            let data = [];
            $('#list > tbody > tr[game="ladder"]').each(function () {
                let progress = $(this).attr("progress");
                let date = $(this).attr("date");
                let server = changeKor($(this).attr("server"));
                let mod = changeKor($(this).attr("mod"));
                data.push({
                    progress: progress,
                    date    : date,
                    server  : server,
                    mod     : mod
                })
            })

            console.log(data)
            parentPort.postMessage({
                type: 1,
                data:data
            });
        } catch (e) {
            logger.error("요청오류", e)
        }
    }

    Promise.all([getChaosCubeRelayBoard(), getChaosCubeRelayUberdia()])
}

function changeKor(data) {
    switch (data) {
        case "asia":
            return "아시아"
        case "europe":
            return "유럽"
        case "america":
            return "아메리카"
        case "softcore":
            return "소프트코어"
        case "hardcore":
            return "하드코어"
    }
}