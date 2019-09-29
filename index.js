const { Sequelize, Model, DataTypes } = require('sequelize');
const { error500 } = require('./error');
const bodyParser = require('body-parser');
const { pathFromConfigAndModel } = require('./lib/functions');


module.exports = class QuokkaApi {

  add(config) {
    const model = config.model;
    const allowedMethods = ['put/id', 'post', 'get', 'delete/id', 'get/id'];

    // ToDo Give option for this
    model.sync();
    // ToDo Give option for this // model.sync( { force: true })
    const path = pathFromConfigAndModel(config)
    const expose = config.expose ? config.expose : allowedMethods;

    expose.filter( (e) => {
      console.log('filter',e)
      if (allowedMethods.indexOf(e) < 0) {
        throw (`${e} is not allowed as a method`);
      }
    });

    const entryHook = async (req, res) => {
      if (config.entryHook) {
        config.entryHook(req, res);
      }
    };

    const preResponseHook = async (req, res) => {
      if (config.preResponseHook) {
        config.preResponseHook(req, res);
      }
    }


    for (const m of expose) {
      let method = null;

      method = m.split('/')[0] // This is only possible because expose is validated and only know values are in!
      if (method === null) throw ('Not a valid method');


      console.log(`Adding ${m} ${path}`)
      this.app[method](path, async (req, res) => {
        try {
          entryHook(req, res);

          let values;
          //get
          if (m === 'get') {
            values = await model.findAll(JSON.parse(req.query.q ? req.query.q : "{}")); // Todo Sanitize this input
          }

          //get/id
          if (m === 'get/id') {
            values = await model.findByPk(req.params.id);
            if (values === null) {
              return error404(err, req, res);
            }
          }
          //post
          if (m === 'post') {
            values = await model.create(req.body);
          }

          //put/id
          if (m === 'put/id') {
            const obj = await model.findByPk(req.params.id)
            if (obj === null) {
              return error404(err, req, res);
            }
            values = obj.update(req.body);
          }

          //delete/id
          if (m === 'delete/id') {
            const obj = await model.findByPk(req.params.id)
            if (obj === null) {
              return error404(err, req, res);
            }
            const values = await obj.destroy();
          }

          preResponseHook(req, res, m, path);

          if (m === 'get') return res.send({ data: values });
          if ((m === 'get/id') || (m === 'post') || (m === 'put/id') || (m === 'delete/id')) return res.send(values)
          error500("We are never suppoed to get here !", req, res);

        }
        catch (err) {
          error500(err, req, res);
        }
      });
    }
  }

  constructor() {
    this.models = {};
    this.Sequelize = Sequelize;
    this.Model = Model;
    this.DataTypes = DataTypes;
    this.app = null;
  }


  async init(config) {
    if (!(config.db.database, config.db.username, config.db.password, config.db.host, config.db.dialect)) {
      throw ('missing configuration parameters. Make sure "config.database, config.username, config.password, config.host, config.dialect" exist');
    } //TODO make error handling here after figure out what to do

    let pool = config.pool ? config.pool : { max: 5, min: 0, acquire: 30000, idle: 10000};
    let host = config.db.host ? config.db.host : 'localhost'

    this.app = config.app;
    this.app.use(bodyParser.json());

    this.sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
      host: config.db.host,
      dialect: config.db.dialect, /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
      pool,
      define: {
        timestamps: true
      }
    });
    // Test if connection works
    try {
      await this.sequelize.authenticate();
      console.log('Connection has been established successfully.');
    }
    catch (err) {
      error500(err, req, res);
    }
  }
}
