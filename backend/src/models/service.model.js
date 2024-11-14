const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');
const Category = require('./category.model');

const Service = sequelize.define('Service', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    priceType: {
        type: DataTypes.ENUM('fixed', 'hourly', 'negotiable'),
        defaultValue: 'fixed'
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serviceArea: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'active', 'inactive', 'rejected'),
        defaultValue: 'pending'
    },
    availableDays: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    workingHours: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    contactNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    contactEmail: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    providerId: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: 'id'
        }
    },
    categoryId: {
        type: DataTypes.INTEGER,
        references: {
            model: Category,
            key: 'id'
        }
    }
});

module.exports = Service;
