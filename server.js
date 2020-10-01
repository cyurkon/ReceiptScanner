const scanner = require('./scanner');
const dotenv = require('dotenv');
const express = require('express');
const multer = require('multer');

dotenv.config();
const app = express()
const port = process.env["PORT"];
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null , file.originalname);
    }
});
// const storage = multer.diskStorage({dest: "./public/uploads"});
const upload = multer({ storage: storage})

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile('public/index.html')
})

app.post("/upload", upload.single("receipt"), (req, res) => {
    //res.send("File uploaded!");
    scanner.processReceipt(req.file.originalname)
        .then(res.send("Scanned!"));
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})