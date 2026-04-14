import Item from "../models/Item.js";
import BorrowRequest from "../models/BorrowRequest.js";
import { uploadItemImages, deleteImage } from "../config/cloudinary.js";

// ── Multer middleware wrapper ──────────────────────────────────
// Wraps multer's callback style into a promise so we can use async/await
const runUpload = (req, res) =>
  new Promise((resolve, reject) => {
    uploadItemImages(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

/**
 * @desc    Create a new item with optional images
 * @route   POST /api/items
 * @access  Private
 */
export const createItem = async (req, res, next) => {
  try {
    // run multer first to parse multipart form + upload images
    await runUpload(req, res);

    const { title, description, category, location, condition } = req.body;

    if (!title?.trim() || !category || !location) {
      return res.status(400).json({ message: "Title, category and location are required" });
    }

    // location comes as JSON string from FormData
    let parsedLocation;
    try {
      parsedLocation = typeof location === "string" ? JSON.parse(location) : location;
    } catch {
      return res.status(400).json({ message: "Invalid location format" });
    }

    const { coordinates } = parsedLocation;
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ message: "Coordinates must be [longitude, latitude]" });
    }

    const [lng, lat] = coordinates.map(Number);
    if (isNaN(lng) || isNaN(lat) || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return res.status(400).json({ message: "Invalid coordinate values" });
    }

    // collect uploaded image URLs from cloudinary
    const images = req.files?.map((f) => f.path) || [];

    const item = await Item.create({
      owner:       req.user._id,
      title:       title.trim(),
      description: description?.trim(),
      category:    category.toLowerCase(),
      condition:   condition || "good",
      isAvailable: true,
      images,
      location: { type: "Point", coordinates: [lng, lat] },
    });

    await item.populate("owner", "name trustScore");
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get nearby available items
 * @route   GET /api/items/nearby
 * @access  Public
 */
export const getNearbyItems = async (req, res, next) => {
  try {
    const { lng, lat, distance = 5000, category } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ message: "Longitude (lng) and latitude (lat) are required" });
    }

    const parsedLng = parseFloat(lng);
    const parsedLat = parseFloat(lat);
    if (isNaN(parsedLng) || isNaN(parsedLat)) {
      return res.status(400).json({ message: "Coordinates must be valid numbers" });
    }

    const filter = {
      isAvailable: true,
      location: {
        $near: {
          $geometry:    { type: "Point", coordinates: [parsedLng, parsedLat] },
          $maxDistance: Math.min(parseInt(distance) || 5000, 50000),
        },
      },
    };

    if (category && category !== "all") filter.category = category.toLowerCase();

    const items = await Item.find(filter)
      .populate("owner", "name trustScore averageRating")
      .select("-__v")
      .limit(50)
      .lean();

    res.json(items);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get items listed by logged-in user
 * @route   GET /api/items/my-items
 * @access  Private
 */
export const getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ owner: req.user._id })
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single item by ID
 * @route   GET /api/items/:id
 * @access  Public
 */
export const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("owner", "name trustScore averageRating totalLends")
      .select("-__v")
      .lean();

    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update item (owner only)
 * @route   PATCH /api/items/:id
 * @access  Private
 */
export const updateItem = async (req, res, next) => {
  try {
    // run multer to handle any new images
    await runUpload(req, res);

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this item" });
    }

    const { title, description, category, condition } = req.body;
    if (title)       item.title       = title.trim();
    if (description) item.description = description.trim();
    if (category)    item.category    = category.toLowerCase();
    if (condition)   item.condition   = condition;

    // append new images if uploaded
    if (req.files?.length) {
      const newImages = req.files.map((f) => f.path);
      item.images = [...(item.images || []), ...newImages].slice(0, 4); // max 4
    }

    await item.save();
    res.json(item);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete item (owner only, not if currently borrowed)
 * @route   DELETE /api/items/:id
 * @access  Private
 */
export const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this item" });
    }

    const active = await BorrowRequest.findOne({ item: item._id, status: "approved" });
    if (active) {
      return res.status(400).json({ message: "Cannot delete an item that is currently borrowed" });
    }

    // delete all images from cloudinary
    await Promise.all((item.images || []).map(deleteImage));

    await item.deleteOne();
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a specific image from an item
 * @route   DELETE /api/items/:id/images
 * @access  Private (owner only)
 */
export const deleteItemImage = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: "Image URL is required" });

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await deleteImage(imageUrl);
    item.images = item.images.filter((img) => img !== imageUrl);
    await item.save();

    res.json({ message: "Image deleted", images: item.images });
  } catch (err) {
    next(err);
  }
};