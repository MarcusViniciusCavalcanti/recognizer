const express = require('express');
const app = express();
const startRecognizer = require('./sendor-detect');
const http = require('http');

let state = false;

const callback = (resultPlates) => {
    if (!state) {
        state = true;

        const lines = resultPlates.split("\n");
        const plates = lines.filter((line) => {
            const elm = line.trim();
            return elm.startsWith('-')
        })
        .map(line => line.replace('-', ''))
        .map(line => line.replace(/\s/g, ''))
        .filter(line => {
            const pattenr = /[A-Z]{3}[0-9][0-9A-Z][0-9]{2}/gmi;
            return pattenr.test(line);
        })
        .map(line => line.replace('confidence', ''))
        .reduce((acc, line, index) => {
            const plateAndConfidence = line.split(':');
            const plate =  {
                plate: plateAndConfidence[0],
                confidence: plateAndConfidence[1]
            };
            acc[index] = plate;
            return acc;
        }, []);

        if (plates.length) {
            const recognizers = {
                recognizers: plates
            }
    
            sendRecognizer(recognizers);
        }
        state = false;
    }
};

app.post('/open', (req, res) => {
    console.log('receive message open');
    res.status(204).send();
});

const start = () => startRecognizer(callback);

const sendRecognizer = (recognizers) => {
    console.log('send recognizers', recognizers)
    const postData = JSON.stringify(recognizers);
    const options = {
        host: '192.168.1.16',
        port: 8080,
        path: '/api/receive-recognizer/ZLYJvwSUNWwHQWQfYjZQfLjhr',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    }

    const request = http.request(options, function(res) {
        res.setEncoding('utf8');
    });

    request.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    request.write(postData);
    request.end();
};

app.listen(9000, () => {
    console.log('Server on');
    start();
});

