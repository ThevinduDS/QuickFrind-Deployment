// transaction.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Booking = require('./booking.model');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    // bookingId: {
    //     type: DataTypes.UUID,
    //     allowNull: false,
    //     references: { model: Booking, key: 'id' }
    // },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending'
    },
    transactionDate: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, { timestamps: true });

// Associations
Booking.hasOne(Transaction, { foreignKey: 'bookingId', onDelete: 'CASCADE' });
Transaction.belongsTo(Booking, { foreignKey: 'bookingId' });

module.exports = Transaction;
