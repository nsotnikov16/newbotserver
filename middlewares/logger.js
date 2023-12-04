const { format, transports, createLogger } = require('winston');
const expressWinston = require('express-winston');

const requestLogger = expressWinston.logger({
  transports: [
    new transports.File({ filename: './logs/express/request.json' }),
  ],
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
});

const errorLogger = expressWinston.errorLogger({
  transports: [
    new transports.File({ filename: './logs/express/error.json' }),
  ],
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
});

const postLogger = createLogger({
  transports: [
    new transports.File({ filename: './logs/post.json' })
  ],
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
})

const infoBotsLogger = createLogger({
  transports: [
    new transports.File({ filename: './logs/infoBots.json' })
  ],
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
})

module.exports = {
  requestLogger,
  errorLogger,
  postLogger,
  infoBotsLogger
};