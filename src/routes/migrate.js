const Router = require('express').Router();
const controller = require('../controllers');

const migrateController = controller.Migrate;

Router.get('/api/admin/migrate/candidate', migrateController.migrationCandidate);

module.exports = Router;
