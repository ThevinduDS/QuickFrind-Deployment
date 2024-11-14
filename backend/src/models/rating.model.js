// rating.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Service = require('./service.model');

const Rating = sequelize.define('Rating', {
    serviceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: Service, key: 'id' }
    },
    ratingScore: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    reviewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, { timestamps: true });

Service.hasOne(Rating, { foreignKey: 'serviceId' });
Rating.belongsTo(Service, { foreignKey: 'serviceId' });

module.exports = Rating;
