/** @format */

import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/Product";
import Category from "../models/Category";
import fs from "fs";
import path from "path";
import Joi from "joi";

// Validasi Input Schema
const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  imageUrl: Joi.string().allow(""),
  price: Joi.number().required(),
  priceRange: Joi.array().items(Joi.number()),
  category: Joi.string().required(),
  featured: Joi.boolean(),
});

// Create a new product
export const createProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const imageUrl = req.file ? `${req.file.destination.split("public/")[1]}/${req.file.filename}` : "";

    const product = new Product({
      ...req.body,
      priceRange: req.body.priceRange ? JSON.parse(req.body.priceRange) : undefined,
      imageUrl,
    });

    const newProduct = await product.save();
    return res.status(201).json(newProduct);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all products with pagination
export const getProducts = async (req: Request, res: Response): Promise<any> => {
  try {
    const { category, page = "1", limit = "10" } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    let query = {};
    if (category && mongoose.isValidObjectId(category as string)) {
      query = { category: new mongoose.Types.ObjectId(category as string) };
    }

    const products = await Product.find(query).populate("category").skip(skip).limit(limitNumber);
    return res.json(products);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Get products by category
export const getProductsByCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { categorySlug } = req.query;
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const products = await Product.find({ category: category._id }).populate("category");
    return res.json(products);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Get featured products
export const getFeaturedProducts = async (_req: Request, res: Response): Promise<any> => {
  try {
    const products = await Product.find({ featured: true }).populate("category");
    return res.json(products);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Update a product
export const updateProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Jika ada file baru, hapus gambar lama
    if (req.file && product.imageUrl) {
      const oldImagePath = path.join(__dirname, "..", "public", product.imageUrl);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error("Failed to delete image:", err);
      });
    }

    const imageUrl = req.file ? `${req.file.destination.split("public/")[1]}/${req.file.filename}` : product.imageUrl;
    const updatedProduct = await Product.findByIdAndUpdate(id, { ...req.body, imageUrl }, { new: true });

    return res.json(updatedProduct);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Hapus gambar terkait jika ada
    if (product.imageUrl) {
      const imagePath = path.join(__dirname, "..", "public", product.imageUrl);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Failed to delete image:", err);
      });
    }

    await Product.findByIdAndDelete(id);
    return res.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
