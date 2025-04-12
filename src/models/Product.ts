/** @format */

import mongoose from "mongoose";

const PriceRangeSchema = new mongoose.Schema({
  min: Number,
  max: Number,
});

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  priceRange: {
    type: PriceRangeSchema,
    default: null,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Product", ProductSchema);
