'use strict';

const express = require('express');
const schibstedCalls = require('../../middleware/schibsted-calls');

const app = express();

app.use(schibstedCalls);

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
