// message.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');

const Message = sequelize.define('Message', {
    senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    receiverId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('sent', 'delivered', 'read'),
        defaultValue: 'sent'
    }
});

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

module.exports = Message;
