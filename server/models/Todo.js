const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Todo text is required"],
      trim: true,
      minlength: [1, "Todo text must be at least 1 character long"],
      maxlength: [500, "Todo text cannot exceed 500 characters"],
    },
    completed: {
      type: Boolean,
      default: false,
      index: true, // Index for faster filtering
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority must be low, medium, or high",
      },
      default: "medium",
      index: true, // Index for faster sorting
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true, // Index for faster date sorting
    },
    completedAt: {
      type: Date,
      default: null,
    },
    category: {
      type: String,
      trim: true,
      maxlength: [50, "Category cannot exceed 50 characters"],
    },
    dueDate: {
      type: Date,
    },
    // New field for better client sync
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    versionKey: false, // Removes __v field
  }
);

// Middleware to set completedAt and lastModified when todo is updated
todoSchema.pre("save", function (next) {
  // Update lastModified on any change
  this.lastModified = new Date();

  // Handle completion status
  if (this.isModified("completed")) {
    if (this.completed && !this.completedAt) {
      this.completedAt = new Date();
    } else if (!this.completed) {
      this.completedAt = null;
    }
  }
  next();
});

// Pre-update middleware
todoSchema.pre(
  ["findOneAndUpdate", "updateOne", "updateMany"],
  function (next) {
    this.set({ lastModified: new Date() });
    next();
  }
);

// Instance method to toggle completion
todoSchema.methods.toggleCompletion = function () {
  this.completed = !this.completed;
  if (this.completed) {
    this.completedAt = new Date();
  } else {
    this.completedAt = null;
  }
  return this.save();
};

// Static method to get todos by priority
todoSchema.statics.getByPriority = function (priority) {
  return this.find({ priority });
};

// Static method to get completed todos
todoSchema.statics.getCompleted = function () {
  return this.find({ completed: true });
};

// Static method to get active todos
todoSchema.statics.getActive = function () {
  return this.find({ completed: false });
};

// Virtual for todo age
todoSchema.virtual("age").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // Days
});

// Ensure virtual fields are serialized
todoSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Todo", todoSchema);
