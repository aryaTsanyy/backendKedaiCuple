/** @format */

import express from "express";
import upload from "../middleware/uploadMemory";
import { createProduct, getProducts, getProductsByCategory, getFeaturedProducts, updateProduct, deleteProduct } from "../controllers/productController";

const router = express.Router();

router.post("/", upload.single("image"), createProduct);
router.get("/", getProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/featured", getFeaturedProducts);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
