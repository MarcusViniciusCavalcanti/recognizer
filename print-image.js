const fs = require('fs');
const path = require('path');

const spawn = require('child_process').spawn;


module.exports = () => {
    const args = ["-w", "640", "-h", "480", "-o", "./image.jpg"];
    spawn('raspistill', args);
}