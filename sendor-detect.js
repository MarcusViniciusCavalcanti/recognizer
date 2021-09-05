const rpio = require('rpio');
const SENDOR = 15;
const printImage = require('./print-image');

rpio.open(SENDOR, rpio.INPUT, rpio.PULL_UP)

setInterval(() => {
    const value = rpio.read(SENDOR);
    console.log('estado', value ? 'on' : 'off')

    if (value) {
        printImage();
    }
}, 500)