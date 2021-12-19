const spawn = require('child_process').spawn;

module.exports = verifyPlate = (callback) => {
    const args = ["-c", "br,eu", "./image.jpg"];
    const result = spawn('alpr', args);
    result.stdout.on('data', data => callback(data.toString()));
}