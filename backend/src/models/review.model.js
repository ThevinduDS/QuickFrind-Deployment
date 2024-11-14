// review.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');
const Service = require('./service.model');

const Review = sequelize.define('Review', {
    serviceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: Service, key: 'id' }
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    ratingScore: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, { timestamps: true });

Service.hasMany(Review, { foreignKey: 'serviceId' });
Review.belongsTo(Service, { foreignKey: 'serviceId' });
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

module.exports = Review;
