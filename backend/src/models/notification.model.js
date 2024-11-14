// notification.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');

const Notification = sequelize.define('Notification', {
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, { timestamps: true });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

module.exports = Notification;
