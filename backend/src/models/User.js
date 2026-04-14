import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, "Name is required"],
      trim:      true,
      minlength: [2,  "Name must be at least 2 characters"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },

    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    password: {
      type:      String,
      required:  [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select:    false,
    },

    // location is entirely optional — only set after user grants permission
    location: {
      type: {
        type:    String,
        enum:    ["Point"],
        // NO default here — prevents saving { type: "Point" } without coordinates
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },

    trustScore: {
      type:    Number,
      default: 0,
      min:     0,
      max:     100,
    },

    averageRating: {
      type:    Number,
      default: 0,
      min:     0,
      max:     5,
    },

    reviewCount: {
      type:    Number,
      default: 0,
      min:     0,
    },

    totalBorrows: {
      type:    Number,
      default: 0,
      min:     0,
    },

    totalLends: {
      type:    Number,
      default: 0,
      min:     0,
    },

    role: {
      type:    String,
      enum:    ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type:    Boolean,
      default: false,
    },

    avatar: {
      type:    String,  // Cloudinary URL
      default: null,
    },

    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

// ── Indexes ───────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ location: "2dsphere" }, { sparse: true }); // sparse = skip docs without location
userSchema.index({ trustScore: -1 });

// ── Password hashing ──────────────────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ── Password comparison ───────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ── Safe public profile ───────────────────────────────────────
userSchema.methods.toPublicProfile = function () {
  return {
    _id:           this._id,
    name:          this.name,
    trustScore:    this.trustScore,
    averageRating: this.averageRating,
    reviewCount:   this.reviewCount,
    totalBorrows:  this.totalBorrows,
    totalLends:    this.totalLends,
    createdAt:     this.createdAt,
  };
};

export default mongoose.model("User", userSchema);