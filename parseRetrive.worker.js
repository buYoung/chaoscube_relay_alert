const axios = require("axios");
const {parentPort, isMainThread} = require("worker_threads")
const logger = require("./logger")
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const moment = require("moment");
const headers = {
    'Content-type'   : 'application/x-www-form-urlencoded; charset=UTF-8',
    'accept'         : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
    'user-agent'     : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'

}
if (!isMainThread) {
    parentPort.on('message', async function (data) {
        switch (data.type) {
            case 1:
                if (data.data.length < 1) {
                    return
                }

                let result = await Promise.all([boardRetrive(data.data[0]), boardRetrive(data.data[1]),
                    boardRetrive(data.data[2]), boardRetrive(data.data[3]), boardRetrive(data.data[4]),
                    boardRetrive(data.data[5]), boardRetrive(data.data[6]), boardRetrive(data.data[7]),
                    boardRetrive(data.data[8]), boardRetrive(data.data[9])])
                parentPort.postMessage({type: 2, data: result});
                break;
        }
    })
}

async function boardRetrive(data) {
    return new Promise((async (resolve, reject) => {
        let url = data.url
        if (url === "") {
            resolve({...data, content: "", date: ""});
        } else {
            axios.get(url, {headers: {...headers}, responseType: "arraybuffer"}).then(value => {
                let $ = cheerio.load(iconv.decode(value.data, "euc-kr").toString());
                resolve({
                    ...data,
                    title  : $('.subject01').text().trim().replace("[래더모집]", ""),
                    content: $('#sita_body').text().trim(),
                    date   : $('.nlink').eq(2).text().trim(),
                });
            }).catch(e => {
                resolve({
                    ...data,
                    content: "null",
                    date : moment(-1)
                })
            })
        }

    }))
}

function eucKrToUtf8(str) {
    var iconv = new iconv('euc-kr', 'utf-8');
    var buf = new Buffer(str, 'binary');
    return iconv.convert(buf).toString();
}