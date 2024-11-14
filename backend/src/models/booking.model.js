// booking.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');
const Service = require('./service.model');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    buyerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    serviceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: Service, key: 'id' }
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
        defaultValue: 'pending'
    },
    bookingDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    serviceDate: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, { timestamps: true });

// Relationships
User.hasMany(Booking, { foreignKey: 'buyerId' });
Booking.belongsTo(User, { foreignKey: 'buyerId' });
Service.hasMany(Booking, { foreignKey: 'serviceId' });
Booking.belongsTo(Service, { foreignKey: 'serviceId' });

module.exports = Booking;
