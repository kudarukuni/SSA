import * as express from 'express'
import * as multer from 'multer'
import * as cors from 'cors'
import * as fs from 'fs'
import * as path from 'path'
import * as Loki from 'lokijs'
import { imageFilter, loadCollection/*, cleanFolder*/ } from './utils';

const DB_NAME = 'db.json';
const COLLECTION_NAME = 'images';
const UPLOAD_PATH = 'uploads';
const upload = multer({ dest: `${UPLOAD_PATH}/`, fileFilter: imageFilter });
const db = new Loki(`${UPLOAD_PATH}/${DB_NAME}`, { persistenceMethod: 'fs' });

const app = express();
app.use(cors());

app.get('/', async (req, res) => {
    res.send(`
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width,initial-scale=1.0">
                    <link rel="icon" href="favicon.ico">
                    <title>Upload API</title>
                </head>
                <body>
                    <h1>The Official ZETDC New Connections Application Server</h1>
                    <p>Please refer to for the <a href="https:portfolio-kudarukuni.vercel.app">maunual</a> of this Server Side Application !!</p>
                    <ul>
                        <li>use GET/images   - to list all uploaded new connection appliations for review.</li>
                        <li>use GET/images/{id} - to get one uploaded new connection application by filename.</li>
                        <li>use POST/profile - to handle single new connection application document upload.</li>
                        <li>use POST/photos/upload - to handle multiple new connection application documents upload.</li>
                    </ul>
                </body>
            </html>
    `);
})

app.post('/profile', upload.single('avatar'), async (req, res) => {
    try {
        const col = await loadCollection(COLLECTION_NAME, db);
        const data = col.insert(req.file);

        db.saveDatabase();
        res.send({ id: data.$loki, fileName: data.filename, originalName: data.originalname });
    } catch (err) {
        res.sendStatus(400);
    }
})

app.post('/photos/upload', upload.array('photos', 12), async (req, res) => {
    try {
        const col = await loadCollection(COLLECTION_NAME, db)
        let data = [].concat(col.insert(req.files));

        db.saveDatabase();
        res.send(data.map(x => ({ id: x.$loki, fileName: x.filename, originalName: x.originalname })));
    } catch (err) {
        res.sendStatus(400);
    }
})

app.get('/images', async (req, res) => {
    try {
        const col = await loadCollection(COLLECTION_NAME, db);
        res.send(col.data);
    } catch (err) {
        res.sendStatus(400);
    }
})

app.get('/images/:id', async (req, res) => {
    try {
        const col = await loadCollection(COLLECTION_NAME, db);
        const result = col.get(req.params.id);

        if (!result) {
            res.sendStatus(404);
            return;
        };

        res.setHeader('Content-Type', result.mimetype);
        fs.createReadStream(path.join(UPLOAD_PATH, result.filename)).pipe(res);
    } catch (err) {
        res.sendStatus(400);
    }
})

app.listen(3000, function () {
    console.log('listening on port 3000');
})