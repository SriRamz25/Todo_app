const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");

const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid todo ID format" });
  }
  next();
};

router.get("/", async (req, res) => {
  try {
    const { filter, sortBy, priority, limit = 100, page = 1 } = req.query;
    console.log("GET /api/todos - Query params:", {
      filter,
      sortBy,
      priority,
      limit,
      page,
    });

    let query = {};

    if (filter === "active") {
      query.completed = false;
    } else if (filter === "completed") {
      query.completed = true;
    }

    if (priority && ["low", "medium", "high"].includes(priority)) {
      query.priority = priority;
    }

    let sortOptions = {};
    switch (sortBy) {
      case "priority":
        sortOptions = { priority: -1, createdAt: -1 };
        break;
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "lastModified":
        sortOptions = { lastModified: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }
    console.log("Sort options:", sortOptions);

    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (parseInt(page) - 1) * limitNum;

    const [todos, total] = await Promise.all([
      Todo.find(query).sort(sortOptions).limit(limitNum).skip(skip),
      Todo.countDocuments(query),
    ]);

    if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      todos.sort((a, b) => {
        if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    res.json({
      success: true,
      count: todos.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limitNum),
      data: todos,
    });
  } catch (error) {
    console.error("Error fetching todos:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching todos",
        error: error.message,
      });
  }
});

router.get("/:id", validateObjectId, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo)
      return res
        .status(404)
        .json({ success: false, message: "Todo not found" });
    res.json({ success: true, data: todo });
  } catch (error) {
    console.error("Error fetching todo:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching todo",
        error: error.message,
      });
  }
});

router.post("/", async (req, res) => {
  try {
    const { text, priority, category, dueDate } = req.body;
    if (!text || text.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Todo text is required" });
    }

    const todo = new Todo({
      text: text.trim(),
      priority: priority || "medium",
      category,
      dueDate: dueDate ? new Date(dueDate) : null,
    });
    const savedTodo = await todo.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Todo created successfully",
        data: savedTodo,
      });
  } catch (error) {
    console.error("Error creating todo:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ success: false, message: "Validation error", errors });
    }
    res
      .status(500)
      .json({
        success: false,
        message: "Error creating todo",
        error: error.message,
      });
  }
});

router.put("/:id", validateObjectId, async (req, res) => {
  try {
    const { text, completed, priority, category, dueDate } = req.body;
    const todo = await Todo.findById(req.params.id);
    if (!todo)
      return res
        .status(404)
        .json({ success: false, message: "Todo not found" });

    if (text !== undefined) todo.text = text.trim();
    if (completed !== undefined) todo.completed = completed;
    if (priority !== undefined) todo.priority = priority;
    if (category !== undefined) todo.category = category;
    if (dueDate !== undefined)
      todo.dueDate = dueDate ? new Date(dueDate) : null;

    const updatedTodo = await todo.save();
    res.json({
      success: true,
      message: "Todo updated successfully",
      data: updatedTodo,
    });
  } catch (error) {
    console.error("Error updating todo:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ success: false, message: "Validation error", errors });
    }
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating todo",
        error: error.message,
      });
  }
});

router.patch("/:id/toggle", validateObjectId, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo)
      return res
        .status(404)
        .json({ success: false, message: "Todo not found" });
    const updatedTodo = await todo.toggleCompletion();
    res.json({
      success: true,
      message: `Todo ${updatedTodo.completed ? "completed" : "reopened"}`,
      data: updatedTodo,
    });
  } catch (error) {
    console.error("Error toggling todo:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error toggling todo",
        error: error.message,
      });
  }
});

router.delete("/:id", validateObjectId, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo)
      return res
        .status(404)
        .json({ success: false, message: "Todo not found" });
    await Todo.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: "Todo deleted successfully",
      data: { id: req.params.id },
    });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting todo",
        error: error.message,
      });
  }
});

router.delete("/", async (req, res) => {
  try {
    const result = await Todo.deleteMany({ completed: true });
    res.json({
      success: true,
      message: `${result.deletedCount} completed todos deleted`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting completed todos:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting completed todos",
        error: error.message,
      });
  }
});

router.get("/stats/summary", async (req, res) => {
  try {
    const totalTodos = await Todo.countDocuments();
    const completedTodos = await Todo.countDocuments({ completed: true });
    const activeTodos = await Todo.countDocuments({ completed: false });
    const priorityStats = await Todo.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const stats = {
      total: totalTodos,
      completed: completedTodos,
      active: activeTodos,
      completionRate:
        totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0,
      priorityBreakdown: priorityStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching statistics",
        error: error.message,
      });
  }
});

module.exports = router;
