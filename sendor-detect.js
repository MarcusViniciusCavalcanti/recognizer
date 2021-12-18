const rpio = require('rpio');
const SENSOR = 15;
const printImage = require('./print-image');
const verifyPlate = require('./verify-plate');

rpio.open(SENSOR, rpio.INPUT, rpio.PULL_UP)

module.exports = startRecognizer = (callback) => {
    setInterval(() => {
        const value = rpio.read(SENSOR);    
        if (value) {
            console.log('Sensor detected')
            printImage();
            verifyPlate();
        }
    }, 500)

}