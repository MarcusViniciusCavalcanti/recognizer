const spawn = require('child_process').spawn;

module.exports = verifyPlate = () => {
    const args = ["-c", "br,eu", "./image.jpg"];
    const result = spawn('alpr', args);
    result.stdout.on('data', data => console.log('data:',data.toString()))
}