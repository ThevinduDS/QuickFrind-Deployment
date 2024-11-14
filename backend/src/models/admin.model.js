// admin.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');

const Admin = sequelize.define('Admin', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: User, key: 'id' },
        unique: true // One-to-one relationship with User
    },
    permissions: {
        type: DataTypes.JSON,
        allowNull: true, // Optional: store specific permissions as JSON (e.g., { manageUsers: true, manageServices: true })
    }
}, { timestamps: true });

// Relationships
Admin.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Admin, { foreignKey: 'userId' });

module.exports = Admin;
