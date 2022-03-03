const express = require('express');
const app = express();
const http = require('http');
const Gpio = require('onoff').Gpio;
const rpio = require('rpio');
const spawn = require('child_process').spawn;

const SENSOR = 15;
rpio.open(SENSOR, rpio.INPUT, rpio.PULL_UP);

let CANCEL;
let state = false;
let openCancel = false;

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
            const partOnePlate = plateAndConfidence[0].substring(0, 3);
            const partTwoPlate = plateAndConfidence[0].substring(3);
            const plate =  {
                plate: `${partOnePlate}-${partTwoPlate}`,
                confidence: plateAndConfidence[1]
            };
            acc[index] = plate;
            return acc;
        }, []);

        if (plates.length) {
            const recognizers = {
                recognizers: plates.filter((rec) => rec.confidence >= 75.0)
            }
    
            log(`encounter: ${recognizers.recognizers.length}`)
            sendRecognizer(recognizers);
            setTimeout(() => state = false, 30000)
        } else {
            log('no plate encountered')
            state = false;
        }
    }
};

app.post('/open', (req, res) => {
    openCancel = true;
    CANCEL = new Gpio(12, 'out');
    log('receive request to open cancel')
    setTimeout(() => CANCEL.writeSync(1), 250);
    setTimeout(() => openCancel = false, 30000);
    res.status(204).send();
});

const start = async () => {
    while(true) {
        const value = rpio.read(SENSOR);
        log(`check sensor: ${value}`)
        if (value && !state && !openCancel) {
            log('Sensor detected');
            log('print image');
            const argsPrintImage = ["-w", "640", "-h", "480", "-o", "./image.jpg"];
            spawn('raspistill', argsPrintImage);

            await sleep(6000);
            log('exec process recognizer')
            const argsExecAplr = ["-c", "br,eu", "./image.jpg"];
            const result = spawn('alpr', argsExecAplr);
            result.stdout.on('data', data => {
                callback(data.toString())
                log('complete recognizer')
            });
        }
        await sleep(5000);
    }
};

const sendRecognizer = (recognizers) => {
    log(`send recognizers: ${recognizers}`)
    const postData = JSON.stringify(recognizers);
    const options = {
        host: '161.35.230.173',
        port: 8080,
        path: '/api/receive-recognizer/yAbWXiRzzknNSgHlnwLgLsOnl',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    }

    const request = http.request(options, function(res) {
        res.setEncoding('utf8');
        log('send request');
    });

    request.on('error', function(e) {
        log(`problem with request: ${e.message}`);
    });

    request.write(postData);
    request.end();
};

app.listen(9000, () => {
    log('Server on');
    start();
});


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function log(message) {
    console.log(`[INFO] - ${new Date().toISOString()} --> ${message}`)
}