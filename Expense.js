const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    userEmail: { type: String, required: true }, // Kis user ka kharcha hai
    title: { type: String, required: true },     // Kharche ka naam (e.g., Food, Rent)
    amount: { type: Number, required: true },    // Kitne paise kharch hue
    category: { type: String, required: true },  // Category (e.g., Shopping, Bills)
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', ExpenseSchema);