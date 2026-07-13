const mongoose = require('mongoose');
const Expense = require('./Expense');

// Yeh batata hai ki database me user ka data kis format me save hoga
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Ek email se ek hi account banega
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);