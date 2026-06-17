const mongoose = require('mongoose');

const ExpenseItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  ecoFriendly: { type: Boolean, default: false }
});

const ExpenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  merchant: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  items: [ExpenseItemSchema],
  carbonScore: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  carbonImpact: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
  co2SavedKg: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Expense', ExpenseSchema);
