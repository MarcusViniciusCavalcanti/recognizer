const express = require('express');
const app = express();


app.get('/open', (req, res) => {
    const receive = {
        command: 'ok'
    }

    res.send(receive)
})

app.listen(9000, () => {
    console.log('Server on')
})