import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    owner: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Item must have an owner"],
    },

    title: {
      type:      String,
      required:  [true, "Item title is required"],
      trim:      true,
      minlength: [2,   "Title must be at least 2 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type:      String,
      trim:      true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    category: {
      type:     String,
      enum:     {
        values:  ["books", "tools", "appliances", "electronics", "sports", "kitchen", "others"],
        message: "Category must be one of: books, tools, appliances, electronics, sports, kitchen, others",
      },
      required: [true, "Category is required"],
      lowercase: true,
    },

    images: [
      {
        type: String, // Cloudinary URLs
      },
    ],

    location: {
      type: {
        type:     String,
        enum:     ["Point"],
        default:  "Point",
        required: true,
      },
      coordinates: {
        type:     [Number], // [longitude, latitude]
        required: [true, "Location coordinates are required"],
        validate: {
          validator: (v) => v.length === 2 &&
            v[0] >= -180 && v[0] <= 180 &&
            v[1] >= -90  && v[1] <= 90,
          message: "Invalid coordinates — must be [longitude, latitude]",
        },
      },
    },

    isAvailable: {
      type:    Boolean,
      default: true,
    },

    condition: {
      type:    String,
      enum:    {
        values:  ["new", "good", "used"],
        message: "Condition must be: new, good, or used",
      },
      default: "good",
    },

    totalBorrows: {
      type:    Number,
      default: 0,
      min:     0,
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────
itemSchema.index({ location: "2dsphere" });
itemSchema.index({ owner: 1, isAvailable: 1 });
itemSchema.index({ category: 1, isAvailable: 1 });
// Full-text search on title + description
itemSchema.index({ title: "text", description: "text" });

export default mongoose.model("Item", itemSchema);
