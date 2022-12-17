const express = require('express');
const multer = require('multer')
const http = require('http');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec


const router = express.Router();

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        req.filename = file.originalname
        cb(null, file.originalname)
    },
    destination: (req, file, cb) => {
        
        if(!fs.existsSync('/appFiles/'))
            fs.mkdirSync('/appFiles/')
        cb(null, "/appFiles")
    }
})
const upload = multer({storage})
const MODEL_PATH = "./model.ckpt";

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

router.get('/', upload.single('file'), (req, res, next) => {
    let songName = req.query.songname;
    let artist = req.query.artist;

    if(!fs.existsSync('/appFiles/'))
        fs.mkdirSync('/appFiles/')

    let fileName = artist + " - " + songName;
    let filePath = "/appFiles/" + req.fileName
    
    exec('python scripts/pred.py --num_samples 1 --sample_steps 128 --title ' + songName + ' --artist ' + artist + " " + MODEL_PATH + " " + filePath);
    res.sendStatus(200);
    
})

main();