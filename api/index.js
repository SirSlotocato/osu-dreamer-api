const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec


const router = express.Router();

async function main() {
    let app = express();
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, '../../public')));
    
    app.use('/', router);

    //app.set('port', 3000);
    const server = http.createServer(app);
    server.listen(3000);
    server.on('listening', () => {
        console.log('server is listening')
        
    })

}

router.get('/', (req, res, next) => {
    let songName = req.query.songname;
    let artist = req.query.artist;

    let fileName = artist + " - " + songName;
    let filePath = "./" + fileName

    let mp3File = fs.createWriteStream(filePath);

    mp3File.on('open', () => {
        req.on('data', (data) => {
            console.log('getting data')
            mp3File.write(data);
        })
        req.on('end', () => {
            console.log("download finished");
            mp3File.end();
            exec('python scripts/pred.py --num_samples 1 --sample_steps 128 --title ' + songName + ' --artist ' + artist);
            res.sendFile(filePath);
        })
    })
})

main();