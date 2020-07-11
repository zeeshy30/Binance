const express = require('express');
const WebSocket = require('ws');
const keys = require("./config/keys");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const sql = require("mssql");
const cors = require('cors');
const app = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const config = {
    user: 'SA',
    password: 'mmRJlmal!2',
    server: 'localhost',
    database: 'TestDB',
}

const wss = new WebSocket.Server({ port: 3030 });
wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });
});

const startPopulating = () => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
    ws.on('message', function incoming(data) {
        addDataToSQL(data);
    });
}

const executeQuery = async query => {
    const val = await new sql.Request().query(query);
    return val;
}

function addDataToSQL(data) {
    const parsedData = JSON.parse(data);
    executeQuery(`insert into Tradestream Values (${parsedData.t}, ${parsedData.E}, ${parsedData.T}, ${parseFloat(parsedData.p)})`);
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(parsedData.p);
        }
    });
}

sql.on('error', err => {
    console.log(err);
});


app.post('/api/users/register', function (req, res) {
    const { firstName, lastName, email, password1 } = req.body;
    bcrypt.hash(password1, 12).then((hash_pass) => {
        executeQuery(`insert into Users Values ('${email}', '${firstName}', '${lastName}', '${hash_pass}')`).then(result => {
            res.status(200).json({ message: 'Successfully created' });
        }).catch(err => {
            res.status(400).json({ message: "Email already exists" });
            console.log(err);
        })
    })
});

app.post('/api/users/login', function (req, res) {
    const { email, password } = req.body;

    executeQuery(`SELECT * FROM Users WHERE email='${email}'`)
        .then(result => {
            let values;
            try {
                values = result.recordset[0];
            } catch (err) {
                res.status(400).json({ message: 'Invalid User' });
                return;
            }
            bcrypt.compare(password, values.password)
                .then(isMatched => {
                    if (isMatched) {
                        const { password, ...rest } = values;
                        try {
                            jwt.sign(
                                rest,
                                keys.secretOrKey,
                                {
                                    expiresIn: 86400
                                },
                                (err, token) => {
                                    if (err) {
                                        res.status(400).json({
                                            success: false,
                                            error: err,
                                        });
                                    }
                                    res.json({
                                        success: true,
                                        token: "Bearer " + token
                                    });
                                }
                            );
                        } catch (err) {
                            res.status(400).json({ err });
                        }
                    }
                    else {
                        res.status(400).json({ message: "Invalid Password" });
                    }
                })
                .catch(err => {
                    console.log(err);
                    res.status(400).json({ message: err });
                });
        }).catch(err => {
            res.status(400).json({ err });
        })
});


app.get('/api/trade-data', function (req, res) {
    executeQuery('select * from Tradestream').then(result => {
        res.send(result.recordset);
    })
});



var server = app.listen(3001, function () {

    sql.connect(config).then(() => {
        startPopulating();
    }).catch(err => {
        console.log('cannot be connectd', err);
    });

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
});
