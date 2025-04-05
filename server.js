const express = require('express');
const cors = require('cors');
const errorHandler = require('errorhandler');
const morgan = require('morgan');

const apiRouter = require('./api/api');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

app.use('/api', apiRouter);
app.use(errorHandler());


app.listen(PORT, (err) => {
    if (err) {
        return console.log(`Error starting server: ${err}`);
    }
    console.log(`Server running on PORT: ${PORT}`)
})
module.exports = app;