const User = require('./user.model');
const Service = require('./service.model');
const ServiceImage = require('./serviceImage.model');
const Category = require('./category.model');
const Review = require('./review.model');
const Transaction = require('./transaction.model'); // Payment model
const Booking = require('./booking.model');
const Notification = require('./notification.model');
const Rating = require('./rating.model');
const Admin = require('./admin.model');
const Message = require('./message.model');
const Favourite = require('./favourite.model');

// Define associations payment

// User - Service (Provider)
User.hasMany(Service, { foreignKey: 'providerId', as: 'services' });
Service.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });

// Service - ServiceImage (one-to-many)
Service.hasMany(ServiceImage, { foreignKey: 'serviceId', as: 'images' });
ServiceImage.belongsTo(Service, { foreignKey: 'serviceId' });

// Service - Category (by categoryId)
Category.hasMany(Service, { foreignKey: 'categoryId' });
Service.belongsTo(Category, { foreignKey: 'categoryId' });

// Service - Review
Service.hasMany(Review, { foreignKey: 'serviceId' });
Review.belongsTo(Service, { foreignKey: 'serviceId' });

// User - Review
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

// Booking - User (Buyer)
User.hasMany(Booking, { foreignKey: 'buyerId' });
Booking.belongsTo(User, { foreignKey: 'buyerId' });

// Booking - Service
Service.hasMany(Booking, { foreignKey: 'serviceId' });
Booking.belongsTo(Service, { foreignKey: 'serviceId' });

// Transaction (Payment) - Service (for provider payments)
Service.hasMany(Transaction, { foreignKey: 'serviceId' });
Transaction.belongsTo(Service, { foreignKey: 'serviceId' });

// Transaction (Payment) - User (for provider payments)
User.hasMany(Transaction, { foreignKey: 'providerId' });
Transaction.belongsTo(User, { foreignKey: 'providerId' });

// Transaction - Booking (If related to a specific booking)
Booking.hasOne(Transaction, { foreignKey: 'bookingId', onDelete: 'CASCADE' });
Transaction.belongsTo(Booking, { foreignKey: 'bookingId' });

// Notification - User
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// Rating - Service
Service.hasOne(Rating, { foreignKey: 'serviceId' });
Rating.belongsTo(Service, { foreignKey: 'serviceId' });

// Admin - User
Admin.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Admin, { foreignKey: 'userId' });

// Message - User (Sender and Receiver)
User.hasMany(Message, { foreignKey: 'senderId', as: 'userSentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'userReceivedMessages' });
Message.belongsTo(User, { as: 'messageSender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'messageReceiver', foreignKey: 'receiverId' });

// Favourite - User and Service
User.hasMany(Favourite, { foreignKey: 'userId' });
Favourite.belongsTo(User, { foreignKey: 'userId' });
Service.hasMany(Favourite, { foreignKey: 'serviceId' });
Favourite.belongsTo(Service, { foreignKey: 'serviceId' });

module.exports = {
    User,
    Service,
    ServiceImage,
    Category,
    Review,
    Transaction,
    Booking,
    Notification,
    Rating,
    Admin,
    Message,
    Favourite
};
