/** @format */

import { Request, Response } from "express";
import Category from "../models/Category";

// Create a new category
export const createCategory = async (req: Request, res: Response): Promise<any> => {
  const category = new Category({
    name: req.body.name,
    slug: req.body.slug,
  });

  try {
    const newCategory = await category.save();
    return res.status(201).json(newCategory);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

// Get all categories
export const getCategories = async (_req: Request, res: Response): Promise<any> => {
  try {
    const categories = await Category.find();
    return res.json(categories);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
