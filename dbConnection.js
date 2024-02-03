const mysql = require('mysql2');
//const { Client } = require('pg');
// const client = new Client({
//     host: 'localhost',
//     user: 'postgres',
//     port: 5432,
//     password: 'password',
//     database: 'Utenti'
// });
const client = mysql.createConnection(process.env.DATABASE_URL);
client.connect();

const getUser = (condition) => new Promise((resolve, reject) => {
    console.log("Entra in DBConnection");
    //select * from UserLogin where username="
    client.query(`select * from UserLogin where username='${condition}'`, (err, res) => {
        if (err) {
            reject(err);
            throw console.error(' *** ERROR *** :' + JSON.stringify(err));
        } else {
            console.log('GETTING DATA ', JSON.stringify(res[0]));
            //console.log(' $$$$$$    GETTING $$$$$$ (' + JSON.stringify(res) + ') OF THE DATA :');
            resolve(res[0]);
        }

    })
});

const registerIn = (values) => new Promise((resolve, reject) => {
    client.query(`INSERT INTO UserLogin(username,password,name,lastname) VALUES(?,?,?,?) RETURNING *`, values, (err, res) => {
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

const getProgress = () => new Promise((resolve, reject) => {
    client.query(`SELECT * FROM Progress`, (err, res) => {
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

const deleteProgressById = (id) => new Promise((resolve, reject) => {
    client.query(`delete from Progress where id=${id}`, (err, res) => {
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
    client.query(`INSERT INTO Articoli (descrizione, quantita, data_inserimento) VALUES (?, ?, ?)`, values, (err, res) => {
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

const updateProgress = (id, values) => new Promise((resolve, reject) => {
    client.query(`UPDATE Progress set id=${values[0]}, ammount=${values[1]} where id=${id}`, values, (err, res) => {
        if (err) {
            console.error('ENTERS IN ERROR');
            reject(err);
            throw console.error('ERROR :' + JSON.stringify(err));
        } else {
            console.log('SAVING PROGRESS : ', res);
            resolve(res);
        }

    });
});
//ORDER BY dtProgress 
const getArticoliOrderedBydate = () => new Promise((resolve, reject) => {
    client.query(`SELECT * FROM Progress ORDER BY dtProgress DESC`, (err, res) => {
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



// FETCH BY DATE --> SELECT * FROM Progress ORDER BY hire_date DESC;
module.exports = {
    registerIn,
    getUser,
    saveArticolo,
    getArticoli,
    deleteArticoloById,
    updateProgress,
    getArticoliOrderedBydate,
    deleteProgressById
}