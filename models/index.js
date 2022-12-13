'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const { dbConfig } = require("./../configs");
const db = {};

let sequelize;
if (dbConfig.use_env_variable) {
	sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
	sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
}

(async () => {
	try {
		await sequelize.authenticate();
		console.log('Database Connection has been established successfully.');
	} catch (error) {
		console.error('Unable to connect to the database:', error.message);
	}
})()

fs.readdirSync(__dirname)
	.filter(file => {
		return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
	})
	.forEach(file => {
		db[file.split(".")[0]] = require("./" + file)(sequelize, Sequelize);
	});

Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

module.exports = db;
