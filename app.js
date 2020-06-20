const bodyParser = require('body-parser')
const mysql = require('promise-mysql')
const express = require('express')
const morgan = require('morgan')('dev')
const {checkAndChange} = require('./asset/function')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./asset/swagger.json');
const config = require('./asset/config')

mysql.createConnection({
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password
}).then((db) => {

    console.log('Connected')

    const app = express();

    let MembersRouteur = express.Router();
    let Members = require('./asset/classes/members-class')(db, config)

    app.use(morgan);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(config.rootApi +'api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    MembersRouteur.route('/:id')

        .get(async (req, res) => {
            let member = await Members.getById(req.params.id)
            res.json(checkAndChange(member))
        })

        .put(async (req, res) => {
            let updatedMember = await Members.update(req.params.id, req.body.name, req.body.role)
            res.json(checkAndChange(updatedMember))
        })

        .delete(async (req, res) => {
            let deleteMember = await Members.delete(req.params.id)
            res.json(checkAndChange(deleteMember))
        })


    MembersRouteur.route('/')

        .get(async (req, res) => {
            let allMembers = await Members.getAll(req.query.max)
            res.json(checkAndChange(allMembers))
        })

        .post(async (req, res) => {
            let addMembers = await Members.add(req.body.name)
            res.json(checkAndChange(addMembers))
        })

    app.use(config.rootApi + 'members', MembersRouteur)

    app.listen(config.port, () => console.log(`Started on port ${config.port}`));

}).catch((err) => {
    console.log('Error during database connection')
    console.log(err.message)
})
