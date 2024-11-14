// serviceImage.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Service = require('./service.model');

const ServiceImage = sequelize.define('ServiceImage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serviceId: {
        type: DataTypes.UUID,
        references: {
            model: Service,
            key: 'id'
        }
    }
});

module.exports = ServiceImage;
