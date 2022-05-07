const path = require('path');
const winston = require('winston');
const fs = require("fs")
const winstonDaily = require('winston-daily-rotate-file');

const {combine, timestamp, printf} = winston.format;
const logFormat = printf(info => {
    return `${info.timestamp} ${info.level} ${info.message}`;
})
const logDir = path.join(__dirname, "log");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
const logger = winston.createLogger({
    format: combine(timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        logFormat),
    transports: [
        new winstonDaily({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: path.join(logDir, "info"),
            filename: '%DATE%.log',
            maxFiles: 3,
            zippedArchive: true,
        }),
        new winstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: path.join(logDir, "error"),
            filename: '%DATE%.error.log',
            maxFiles: 3,
            zippedArchive: true,
        })
    ]
})
module.exports = logger