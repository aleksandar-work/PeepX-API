const fs = require('fs');
const bunyan = require('bunyan');
const RotatingFileStream = require('bunyan-rotating-file-stream');

if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
}

const logSettings = {
    gzip: true, // Compress the archive log files to save space
    period: '1d', // daily rotation
    rotateExisting: true, // Give ourselves a clean file when we start up, based on period
    threshold: '10m', // Rotate log files larger than 10 megabytes
    totalFiles: 2, // keep 2 back copies
    totalSize: '20m', // Don't keep more than 20mb of archived log files
};

const date = new Date().toJSON().slice(0, 10);

const errorStreamerRotatedByLength = {
    level: 'error',
    stream: new RotatingFileStream({
        path: `logs/log-${date}.errors.log`,
        ...logSettings,
    }),
    type: 'raw',
};

const infoStreamerRotatedByLength = {
    level: 'info',
    stream: new RotatingFileStream({
        path: `logs/log-${date}.log`,
        ...logSettings,
    }),
    type: 'raw',
};

const mainLoggerStreams = [
    infoStreamerRotatedByLength,
    errorStreamerRotatedByLength,
];

const stream = bunyan.createLogger({
    name: 'peepx',
    serializers: {
        err: bunyan.stdSerializers.err,
        req: require('bunyan-express-serializer'),
        res: bunyan.stdSerializers.res,
    },
    streams: mainLoggerStreams,
});

function logger(id, body, statusCode) {
    const log = stream.child(
        {
            body,
            id,
            statusCode,
        },
        true,
    );

    if (statusCode > 404) {
        return log.error(body);
    }

    return log.info(body);
}

module.exports = {
    logger,
    stream,
};
