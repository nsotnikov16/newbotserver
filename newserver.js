require('dotenv').config();
const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const { requestLogger, errorLogger, postLogger } = require('./middlewares/logger');
const Processing = require('./tools/classes/Processing');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, }));

app.use(requestLogger);

app.get('/', (req, res) => res.send('<h1>The server is running</h1>'));

app.post('/', async (req, res) => {
    postLogger.info({ body: req.body, params: req.params });
    const processing = new Processing(req.body);
    processing.start();
    res.status(200).send();
})

app.use(errorLogger);

app.listen(2526, '45.141.76.219', () => console.log('Server started...'))
