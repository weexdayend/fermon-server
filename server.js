const express = require("express");

const app = express();

app.use('/', (req, res) => {
    res.send('Hello from fermon server');
});

app.listen(4000, () => {
    console.log('Server fermon is running on Port 4000!');
});