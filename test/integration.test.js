const express = require('express');
const request = require('request-promise-native');
const QuokkaApi = require('quokka-api')

let server, quokka;

beforeAll(async () => {
    const app = express()
    const port = 3000

    app.get('/', (req, res) => res.send('Hello World!'))

    server = app.listen(port, () => console.log(`Test server listening on port ${port}!`));

    quokka = new QuokkaApi()
    await quokka.init(
        {
            app,
            db: {
                database: 'helloworld', // required
                password: 'password', // required
                username: 'postgres', // required
                dialect: 'postgres', // required
                host: 'localhost', // optional: defaults to localhost
                pool: { // optional: use this defaults
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

    const preResponseHook = async (req, res, type, path) => {
        // Log: Replied with status code xxx to request...
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


});

afterAll(async () => {
    await quokka.sequelize.close();
    server.close();
});

test('Hello World', async () => {
    let response;
    try {
        response = await request.get('http://localhost:3000/')
        console.log('Response', response);
    }
    catch (err) {
        console.log(err);
    }
    expect(response).toBe("Hello World!");
});


test('Add User', async () => {
    let response;

    var options = {
        uri: 'http://localhost:3000/v1/quokka/users',
        // qs: {
        //     access_token: 'xxxxx xxxxx' // -> uri + '?access_token=xxxxx%20xxxxx'
        // },
        headers: {
            'User-Agent': 'Request-Promise',
            'authorization': '1234'
        },
        body: {
            firstName: 'firstB',
            lastName: 'lastB',
        },
        json: true // Automatically parses the JSON string in the response
    };

    try {
        response = await request.post(options)
        // console.log('Response Post', response);
    }
    catch (err) {
        console.log('Error on "Add User" test');
    }
    expect(response).toHaveProperty('firstName');


});


test('Get Users', async () => {
    let response;

    var options = {
        uri: 'http://localhost:3000/v1/quokka/users',
        // qs: {
        //     access_token: 'xxxxx xxxxx' // -> uri + '?access_token=xxxxx%20xxxxx'
        // },
        headers: {
            'User-Agent': 'Request-Promise',
            'authorization': '1234'
        },
        json: true // Automatically parses the JSON string in the response
    };


    try {
        response = await request.get(options)
        console.log('Response', response);
    }
    catch (err) {
        console.log(err);
    }
    expect(response).toHaveProperty('data');
});
