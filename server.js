const express = require("express");

const app = express();

app.use('/', (req, res) => {
    res.send('This API using Workflows Action to Push and Deploya.');
});

app.listen(4000, () => {
    console.log('Server fermon is running on Port 4000!');
});