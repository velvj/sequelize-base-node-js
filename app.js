require('dotenv').config()
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
let routers = require("./routes");
const app = express();
const path = require('path')
const moment = require("moment-timezone")
moment.tz.setDefault('America/New_York');

// middle wares section
const appLogger = require("./middleware/logger");
app.use(appLogger.requestDetails(appLogger));
app.use(helmet());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', ['http://localhost:3000/','http://104.131.14.223:2335/','https://preprod.getvenn.com','https://preprodapis.getvenn.com/']);
    next();
});
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.get("/", (req, res) => {
    res.status(200).send({
        status: 200,
        message: 'Api Running!!'
    })
});

app.get("/v1/api/healthCheck", (req, res) => {
    res.status(200).send({
        status: 200,
        message: 'User Api is Running!'
    })
});

app.use(require('morgan')('dev', {
	skip: function (req, res) { return res.statusCode < 400 }
}));
app.use("/public", express.static(path.join(__dirname, 'public')));
require('./middleware/swagger')(app)
routers(app)
app.use((req, res, next) => {
	const error = new Error('Not found');
	error.status = 404;
	next(error);
});

app.use(require('./middleware/errorHandler'))


const port = process.env.PORT || 2330;

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
