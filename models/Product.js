const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  material: String,
  barcode: String,
  description: String,
  category: { type: String, default: 'Uncategorized' }
}, { versionKey: false, timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
