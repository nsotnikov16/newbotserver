require('dotenv').config();
const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const Logger = require('./lib/Logger');
const Processing = require('./lib/Processing');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, }));

app.use(Logger.request);

app.get('/', (req, res) => res.send('<h1>The server is running</h1>'));

app.post('/', async (req, res) => {
    Logger.call('post', { body: req.body });
    const processing = new Processing(req.body);
    processing.start();
    res.status(200).send();
})

app.use(Logger.error);

app.listen(process.env.PORT, () => console.log('Server started...'))
