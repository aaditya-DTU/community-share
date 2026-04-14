import express from "express";
import {
  createItem,
  getNearbyItems,
  getItemById,
  getMyItems,
  updateItem,
  deleteItem,
  deleteItemImage,
} from "../controllers/itemController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/nearby",        getNearbyItems);
router.get("/my-items",      protect, getMyItems);
router.post("/",             protect, createItem);
router.get("/:id",           getItemById);
router.patch("/:id",         protect, updateItem);
router.delete("/:id",        protect, deleteItem);
router.delete("/:id/images", protect, deleteItemImage);

export default router;