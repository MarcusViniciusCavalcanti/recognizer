const spawn = require('child_process').spawn;


module.exports = printImage = () => {
    const args = ["-w", "640", "-h", "480", "-o", "./image.jpg"];
    spawn('raspistill', args);
}