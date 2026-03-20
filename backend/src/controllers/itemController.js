import Item from "../models/Item.js";
import BorrowRequest from "../models/BorrowRequest.js";

/**
 * @desc    Create a new item
 * @route   POST /api/items
 * @access  Private
 */
export const createItem = async (req, res, next) => {
  try {
    const { title, description, category, location, condition } = req.body;

    if (!title?.trim() || !category || !location?.coordinates) {
      return res.status(400).json({ message: "Title, category and location are required" });
    }

    const { coordinates } = location;
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ message: "Coordinates must be [longitude, latitude]" });
    }

    const [lng, lat] = coordinates.map(Number);
    if (isNaN(lng) || isNaN(lat) || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return res.status(400).json({ message: "Invalid coordinate values" });
    }

    const item = await Item.create({
      owner:       req.user._id,
      title:       title.trim(),
      description: description?.trim(),
      category:    category.toLowerCase(),
      condition:   condition || "good",
      isAvailable: true,
      location:    { type: "Point", coordinates: [lng, lat] },
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
          $geometry:   { type: "Point", coordinates: [parsedLng, parsedLat] },
          $maxDistance: Math.min(parseInt(distance) || 5000, 50000), // cap at 50km
        },
      },
    };

    if (category && category !== "all") {
      filter.category = category.toLowerCase();
    }

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

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update an item (owner only)
 * @route   PATCH /api/items/:id
 * @access  Private
 */
export const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this item" });
    }

    // Only allow safe fields to be updated
    const { title, description, category, condition } = req.body;
    if (title)       item.title       = title.trim();
    if (description) item.description = description.trim();
    if (category)    item.category    = category.toLowerCase();
    if (condition)   item.condition   = condition;

    await item.save();

    res.json(item);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete an item (owner only, only if not currently borrowed)
 * @route   DELETE /api/items/:id
 * @access  Private
 */
export const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this item" });
    }

    // block deletion if item is currently on loan
    const activeRequest = await BorrowRequest.findOne({
      item:   item._id,
      status: "approved",
    });
    if (activeRequest) {
      return res.status(400).json({ message: "Cannot delete an item that is currently borrowed" });
    }

    await item.deleteOne();

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    next(err);
  }
};
