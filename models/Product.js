import mongoose from 'mongoose'

const Product = mongoose.model('Product', {
    name: { type: String, required: true },
    image: { type: String },
    description: { type: String, required: true },
    price: { type: Number, default: 0, required: true },
    countInStock: { type: Number, default: 0, required: true },
  });

  export default Product
  