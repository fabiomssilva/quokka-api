const { Sequelize, Model, DataTypes } = require('sequelize');
const { error500 } = require('./error');
const bodyParser = require('body-parser');
const { pathFromConfigAndModel } = require('./lib/functions');


module.exports = class QuokkaApi {

  add(config) {
    const model = config.model;

    // ToDo Give option for this
    model.sync();
    // ToDo Give option for this // model.sync( { force: true })
    const path = pathFromConfigAndModel(config)
    const expose = config.expose ? config.expose : ['put/id', 'post', 'get', 'delete/id', 'get/id'];

    const entryHook = async (req,res) => {
      if (config.entryHook) {
        config.entryHook(req, res);
      }
    };

    const preResponseHook = async(req,res) => {
      if (config.preResponseHook) {
        config.preResponseHook(req,res);
      }
    }    

    if (expose.indexOf('get') >= 0) {
      console.log(`Adding get ${path}`)
      this.app.get(path, async (req, res) => {
        try {
          entryHook(req,res);
          const values = await model.findAll(JSON.parse(req.query.q ? req.query.q : "{}")); // Todo Sanitize this input
          preResponseHook(req,res);
          return res.send({ data: values });
        }
        catch (err) {
          error500(err, req, res);
        }
      });
    }

    if (expose.indexOf('get/id') >= 0) {
      console.log(`Adding get/id ${path}/:id`)
      this.app.get(`${path}/:id`, async (req, res) => {
        try {
          entryHook(req,res);
          const value = await model.findByPk(req.params.id);
          if (value === null) {
            return error404(err, req, res);
          }
          preResponseHook(req,res);
          return res.send(value)
        }
        catch (err) {
          error500(err, req, res);
        }
      });
    }

    if (expose.indexOf('post') >= 0) {
      console.log(`Adding post ${path}`)
      this.app.post(path, async (req, res) => {
        try {
          entryHook(req,res);
          const result = await model.create(req.body);
          preResponseHook(req,res);
          return res.send(result);
        }
        catch (err) {
          error500(err, req, res);
        }
      });
    }

    if (expose.indexOf('put/id') >= 0) {
      console.log(`Adding put/id ${path}/:id`)
      this.app.put(`${path}/:id`, async (req, res) => { //ToDo: Add upsert option.
        try {
          entryHook(req,res);
          const obj = await model.findByPk(req.params.id)
          if (obj === null) {
            return error404(err, req, res);
          }
          const result = obj.update(req.body);
          preResponseHook(req,res);
          return res.send(result);
        }
        catch (err) {
          error500(err, req, res);
        }
      });
    }

    if (expose.indexOf('delete/id') >= 0) {
      console.log(`Adding delete/id ${path}/:id`)
      this.app.delete(`${path}/:id`, async (req, res) => {
        try {
          entryHook(req,res);
          const obj = await model.findByPk(req.params.id)
          if (obj === null) {
            return error404(err, req, res);
          }
          const result = await obj.destroy();
          preResponseHook(req,res);
          return res.send(result)
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

    this.app = config.app;
    this.app.use(bodyParser.json());

    this.sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
      host: config.db.host,
      dialect: config.db.dialect, /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
      pool: config.pool,
      define: {
        timestamps: true
      }
    });
    // Test if connection works
    try {
      await this.sequelize.authenticate();
      console.log('Connection has been established successfully.');
    }
    catch(err) {
      error500(err, req, res);
    }
  }
}
