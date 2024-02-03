const express = require('express');
require('dotenv').config();
const connection2 = require('./dbConnection.js');
const jwt = require('jsonwebtoken');
const app = express();
const bcrypt = require('bcrypt');
const port = process.env.PORT || 3001; // ASSEGNA LA PORTA DISPONIBILE DALL'HOSTING SERVER..
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

const cors = require('cors');

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // For legacy browser support
}

app.use(cors(corsOptions));

// LOGIN
app.post('/user/login', async (req, res) => {
    const user = await connection2.getUser(req.body.username);
    if (user == null || user == undefined) {
        console.log('ENTRA NEL PRIMO IF, USER IS ', user);
        return res.status(400).send('Username does not exists');
    }
    if (await bcrypt.compare(req.body.password, user.password)) {
        user.token = jwt.sign(user, 'shhhhh', { expiresIn: '1h' });
        console.log("TOKEN ", user);
        return res.status(200).send(user);
    } else {
        return res.status(401).send('Password is not correct');
    }

});

// REGISTRATION
app.post('/user/register', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        let name = await connection2.getUser(req.body.username);
        if (name != null) {
            res.status(400).send('Username not available');
        }
        const user = [req.body.name, req.body.lastname, req.body.username, hashedPassword];
        const result = await connection2.registerIn(user);
        res.status(200).send('Registered succesfully')
    } catch {
        res.status(400).send('Somenthing went wrong')
    }

});

// ****** ARTICOLI *****************

app.post('/addArticolo', async (req, res) => {
    let code = 400;
    let message = "Something went wrong";
    let decoded = {};
    console.log('BEARE BEFORE SLICE ', JSON.stringify(req.body.headers.Authorization));
    const bearerToken = req.body.headers.Authorization;

    let token = bearerToken.slice(bearerToken.indexOf(" ") + 1, bearerToken.length);
    console.log('TOKEN #1:', token);
    if (!token) {
        console.log("entra in if se token null o undefined");
        code = 400;
        message = 'Access denied. No token provided.';
    }
    try {
        decoded = jwt.verify(token, 'shhhhh');
        if (decoded === undefined) {
            res.status(401).send('Unauthorized')
        }
        let responseBody = [];
        let ammount = 0;
        let dtProgress = null;// new Date().toISOString().slice(0, 10);
        console.log('REQ BODY: ', req.body.body);
        for (const item of req.body.body) {
            let articolo = await connection2.saveArticolo([item.descrizione, item.quantita, item.data_inserimento]);
            responseBody.push(articolo.insertId);
            ammount = ammount + parseInt(item.quantita, 10);
            console.log('AMMOUNT ', ammount);
            dtProgress = item.data_inserimento;
        }
        await connection2.saveProgress([dtProgress, ammount]);
        res.status(200).send(responseBody);
        console.log('RES FINO A QUI ', responseBody.length);
    }
    catch {

        res.status(400).send('Somenthing went wrong')
    }
});

app.post('/updateProgress/:id', async (req, res) => {
    let code = 400;
    let message = "Something went wrong";
    let decoded = {};
    console.log('BEARE BEFORE SLICE ', JSON.stringify(req.body.headers.Authorization));
    const bearerToken = req.body.headers.Authorization;

    let token = bearerToken.slice(bearerToken.indexOf(" ") + 1, bearerToken.length);
    console.log('TOKEN #1:', token);
    if (!token) {
        console.log("entra in if se token null o undefined");
        code = 400;
        message = 'Access denied. No token provided.';
    }
    try {
        decoded = jwt.verify(token, 'shhhhh');
        if (decoded === undefined) {
            res.status(401).send('Unauthorized')
        }
        let responseBody = [];
        let ammount = 0;
        let body = req.body.body;
        let id = req.params.id;
        console.log('REQ BODY: ', req.body.body);
        let articolo = await connection2.updateProgress(id, [body.id, body.ammount]);
        res.status(200).send(responseBody);
        console.log('RES FINO A QUI ', responseBody.length);
    }
    catch {

        res.status(400).send('Somenthing went wrong')
    }
})

app.get('/getArticoli', async (req, res) => {
    let code = 400;
    let message = "Something went wrong";
    let decoded = {};
    const bearerToken = req.header('Authorization');
    let token = bearerToken.slice(bearerToken.indexOf(" ") + 1, bearerToken.length);
    console.log('TOKEN #1:', token);
    if (!token) {
        console.log("entra in if se token null o undefined");
        code = 400;
        message = 'Access denied. No token provided.';
    }
    try {
        console.log('TRY DECODED #1:', decoded);
        decoded = jwt.verify(token, 'shhhhh');
        console.log('DECODED #2:', decoded);
        if (!decoded) {
            res.status(401).send('Unauthorized')
        }
        let topics = await connection2.getArticoli();
        res.status(200).send(topics);

    } catch {
        console.log('Res 400 :', decoded);
        res.status(code).send(message)
    }
})

app.delete('/deleteArticolo/:id', async (req, res) => {
    let code = 400;
    let message = "Something went wrong";
    let decoded = {};
    const bearerToken = req.header('Authorization');
    let token = bearerToken.slice(bearerToken.indexOf(" ") + 1, bearerToken.length);
    console.log('TOKEN #1:', token);
    if (!token) {
        console.log("entra in if se token null o undefined");
        code = 400;
        message = 'Access denied. No token provided.';
    }
    console.log("calling entry delete ", req.params.id);
    try {
        decoded = jwt.verify(token, 'shhhhh');
        if (decoded === undefined) {
            res.status(401).send('Unauthorized')
        }
        let topics = await connection2.deleteArticoloById(req.params.id);
        res.status(200).send(topics);

    } catch {
        console.log('Res 400 deleting:', res);
        res.status(400).send('Somenthing went wrong')
    }
});

app.delete('/deleteProgress/:id', async (req, res) => {
    let code = 400;
    let message = "Something went wrong";
    let decoded = {};
    const bearerToken = req.header('Authorization');
    let token = bearerToken.slice(bearerToken.indexOf(" ") + 1, bearerToken.length);
    console.log('TOKEN #1:', token);
    if (!token) {
        console.log("entra in if se token null o undefined");
        code = 400;
        message = 'Access denied. No token provided.';
    }
    console.log("calling entry delete ", req.params.id);
    try {
        decoded = jwt.verify(token, 'shhhhh');
        if (decoded === undefined) {
            res.status(401).send('Unauthorized')
        }
        let topics = await connection2.deleteProgressById(req.params.id);
        res.status(200).send(topics);

    } catch {
        console.log('Res 400 deleting:', res);
        res.status(400).send('Somenthing went wrong')
    }
});

app.get('/getProgressOrderedByDate', async (req, res) => {
    let code = 400;
    let message = "Something went wrong";
    let decoded = {};
    const bearerToken = req.header('Authorization');
    let token = bearerToken.slice(bearerToken.indexOf(" ") + 1, bearerToken.length);
    console.log('TOKEN #1:', token);
    if (!token) {
        console.log("entra in if se token null o undefined");
        code = 400;
        message = 'Access denied. No token provided.';
    }
    try {
        console.log('TRY DECODED #1:', decoded);
        decoded = jwt.verify(token, 'shhhhh');
        console.log('DECODED #2:', decoded);
        if (!decoded) {
            res.status(401).send('Unauthorized')
        }
        let topics = await connection2.getArticoliOrderedBydate();
        res.status(200).send(topics);

    } catch {
        console.log('Res 400 :', decoded);
        res.status(code).send(message)
    }
});


app.listen(port, () => console.log(`Listening on port ${port} ...`));