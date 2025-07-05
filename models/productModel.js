const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  material: String,
  barcode: String,
  description: String,
  category: { type: String, default: 'Uncategorized' }
}, { versionKey: false });

module.exports = mongoose.model('Product', productSchema);
