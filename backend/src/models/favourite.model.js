// favourite.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');
const Service = require('./service.model');

const Favourite = sequelize.define('Favourite', {
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    serviceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: Service, key: 'id' }
    }
}, { timestamps: false });

User.hasMany(Favourite, { foreignKey: 'userId' });
Favourite.belongsTo(User, { foreignKey: 'userId' });
Service.hasMany(Favourite, { foreignKey: 'serviceId' });
Favourite.belongsTo(Service, { foreignKey: 'serviceId' });

module.exports = Favourite;
