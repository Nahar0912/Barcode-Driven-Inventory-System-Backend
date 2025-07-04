const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    barcode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    image: String,
    category: { type: String, default: 'Uncategorized' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
