const express = require('express');
const app = express();
const startRecognizer = require('./sendor-detect')


const callback = (resultPlates) => {
    console.log("result plate:", resultPlates)
}


app.get('/open', (req, res) => {
    const receive = {
        command: 'ok'
    }

    res.send(receive)
})


const start = () => startRecognizer(callback);

app.listen(9000, () => {
    console.log('Server on');
    start();
})

