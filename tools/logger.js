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

const apiLogger = createLogger({
  transports: [
    new transports.File({ filename: './logs/api.json' })
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
  apiLogger
};