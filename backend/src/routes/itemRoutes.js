import express from "express";
import {
  createItem,
  getNearbyItems,
  getItemById,
  getMyItems,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// specific named routes BEFORE /:id to avoid route shadowing
router.get("/nearby",   getNearbyItems);           // public
router.get("/my-items", protect, getMyItems);      // private

router.post("/",        protect, createItem);      // private
router.get("/:id",      getItemById);              // public
router.patch("/:id",    protect, updateItem);      // private (owner only)
router.delete("/:id",   protect, deleteItem);      // private (owner only)

export default router;
