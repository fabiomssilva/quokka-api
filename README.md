##This is WIP. Do not use it yet ! :)

# quokka-api
API ORM That integrates with Express. For happy developers.
It exposes selected database tables and creates a API around each table with the common get, put, post, delete http methods.

###Why ?
Quokka api was built to integrate with already existing express apps. This way it is still possible to build the remaining part of the app as you want.

As ORM it exposes sequelize over the REST API.

It allows to define a `entryHook` that will execute before the database statement is executed. This allow for example to add authentication.

It also allow a `preResponseHook` that will execute before sending the response to the client. This can be usefull to add headers for example.

### Example app

app.js
```
'use strict'
const express = require('express')
var bodyParser = require('body-parser')
const QuokkaApi = require('quokka-api')
const app = express()

app.get('/', (req, res) => res.send('Hello world!'))

const quokka = new QuokkaApi(
    {
        app,
        db: {
            database: 'helloworld',
            password: 'password',
            username: 'postgres',
            dialect: 'postgres',
            host: 'localhost', // Todo set default to localhost
            pool: { // Todo Set default for this.
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
        },
    },
);

class User extends quokka.Model { }
User.init({ // In case you need to check if the model matches database: https://www.npmjs.com/package/sequelizr
    // attributes
    firstName: {
        type: quokka.Sequelize.STRING,
        allowNull: false
    },
    lastName: {
        type: quokka.Sequelize.STRING
        // allowNull defaults to true
    }
}, {
    sequelize: quokka.sequelize,
    modelName: 'user',
    options: {
        timestamps: true,
    },
});

const entryHook = async (req, res) => {
    if (!req.headers.authorization) {
        return res.status(403).json({ error: 'No credentials sent!' });
    }
    console.log(req.route.methods)
    if (req.headers.authorization === '1234') { // All access
        return;
    }
    if (req.headers.authorization === '123' && req.route.methods.get === true) { // read Only
        return;
    }
    return res.status(403).json({ error: '' });
}

const preResponseHook = async (req, res) => {
    console.log(res);
    res.set({
        'X-Header1': 'header-one',
        'X-Header2': '123',
        'X-Header3': '12345'
    })
}


quokka.add(
    {
        model: User,
        expose: ['put/id', 'post', 'get', 'delete/id', 'get/id'], //  (optional, default: all).
        apiPrefix: '/v1/quokka', // What is the path prefix (optional)
        apiEntityRewrite: 'users', // If table name is to be renamed (optional)
        entryHook, // (optional)
        preResponseHook, //  (optional)
    });

module.exports = app


```

app.local.js
```
'use strict'
const app = require('./app')
const port = process.env.PORT || 3000
app.listen(port, () =>   console.log(`Server is listening on port ${port}.`))
```