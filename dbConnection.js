const mysql = require('mysql2');
const { Client } = require('pg');

const pg = new Client({
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: 'password',
    database: 'Utenti'
});


// const client = new Client({
//     host: 'localhost',
//     user: 'postgres',
//     port: 5432,
//     password: 'password',
//     database: 'Utenti'
// });
const client = mysql.createConnection(process.env.DATABASE_URL);
pg.connect();
client.connect();

const getUser = (condition) => new Promise((resolve, reject) => {
    console.log("Entra in DBConnection");
    pg.query(`select * from UserLogin where username='${condition}'`, (err, res) => {
        if (err) {
            reject(err);
            throw console.error(' *** ERROR *** :' + JSON.stringify(err));
        } else {
            console.log('GETTING DATA ', JSON.stringify(res.rows[0]));
            //console.log(' $$$$$$    GETTING $$$$$$ (' + JSON.stringify(res) + ') OF THE DATA :');
            resolve(res.rows[0]);
        }

    })
});

const registerIn = (values) => new Promise((resolve, reject) => {
    pg.query(`INSERT INTO userlogin(name,lastname,username,password) VALUES($1, $2, $3, $4) RETURNING *`, values, (err, res) => {
        if (err) {

            reject(err);
            throw console.error('ERROR :' + JSON.stringify(err));
        } else {

            console.log('SAVING THE DATA :' + JSON.stringify(res));
            resolve(res.rows[0]);
        }
        client.end();

    })
});

// *********** ARTICOLI **********************

const getArticoli = () => new Promise((resolve, reject) => {
    client.query(`SELECT * FROM Articoli`, (err, res) => {
        if (err) {
            reject(err);
            throw console.error('ERROR :' + JSON.stringify(err));
        } else {
            console.log('RETRIEVING DATA', JSON.stringify(res));
            resolve(res);
        }
        //client.end();
    })
})

const deleteArticoloById = (id) => new Promise((resolve, reject) => {
    client.query(`delete from Articoli where id=${id}`, (err, res) => {
        if (err) {
            console.error('ENTERS IN ERROR DELETE');
            reject(err);
            throw console.error('ERROR :' + JSON.stringify(err));
        } else {
            console.log('DELETING DATA SUCCESSFULLY: ', res);
            resolve(res);
        }
    })
});

const saveArticolo = (values) => new Promise((resolve, reject) => {
    client.query(`INSERT INTO Articoli (id, descrizione, quantita, data_inserimento, total) VALUES (?, ?, ?, ?, ?)`, values, (err, res) => {
        if (err) {
            console.error('ENTERS IN ERROR');
            reject(err);
            throw console.error('ERROR :' + JSON.stringify(err));
        } else {
            console.log('SAVING THE DATA : ');
            resolve(res);
        }

    });
});


module.exports = {
    registerIn,
    getUser,
    saveArticolo,
    getArticoli,
    deleteArticoloById
}