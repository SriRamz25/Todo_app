import { useState, useEffect } from "react";
import {
  ListTodo,
  CheckCircle2,
  Circle,
  Flame,
  TrendingUp,
  LayoutGrid,
  List,
  ArrowUpDown,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TodoCard } from "./components/TodoCard";
import { QuickAddBar } from "./components/QuickAddBar";
import { Button } from "./components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { toast, Toaster } from "sonner";
import { todoAPI } from "./services/api";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [sortBy, setSortBy] = useState("recent");
  const [editingTodo, setEditingTodo] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load todos from API
  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await todoAPI.getTodos({ filter, sortBy });
      setTodos(response.data || []);
    } catch (error) {
      setError(error.message);
      toast.error(`Failed to load todos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, [filter, sortBy]);

  const handleAddTodo = async (text, priority) => {
    try {
      const response = await todoAPI.createTodo({ text, priority });
      if (response.success) {
        await loadTodos(); // Reload todos to get updated list
        toast.success("Task added successfully!");
      }
    } catch (error) {
      toast.error(`Failed to add todo: ${error.message}`);
    }
  };

  const handleToggleTodo = async (id) => {
    try {
      const todo = todos.find((t) => t._id === id || t.id === id);
      if (!todo) return;

      const newCompleted = !todo.completed;
      const response = await todoAPI.toggleTodo(
        todo._id || todo.id,
        newCompleted
      );

      if (response.success) {
        await loadTodos(); // Reload to get updated data
        if (newCompleted) {
          toast.success("Great job! Task completed ");
        }
      }
    } catch (error) {
      toast.error(`Failed to update todo: ${error.message}`);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      const todo = todos.find((t) => t._id === id || t.id === id);
      if (!todo) return;

      const response = await todoAPI.deleteTodo(todo._id || todo.id);
      if (response.success) {
        await loadTodos(); // Reload to get updated list
        toast.success("Task deleted");
      }
    } catch (error) {
      toast.error(`Failed to delete todo: ${error.message}`);
    }
  };

  const handleEditTodo = (id) => {
    const todo = todos.find((t) => t._id === id || t.id === id);
    if (todo) {
      setEditingTodo(todo);
      setEditText(todo.text);
    }
  };

  const handleSaveEdit = async () => {
    if (editingTodo && editText.trim()) {
      try {
        const response = await todoAPI.updateTodo(
          editingTodo._id || editingTodo.id,
          {
            text: editText.trim(),
          }
        );

        if (response.success) {
          await loadTodos(); // Reload to get updated data
          setEditingTodo(null);
          setEditText("");
          toast.success("Task updated");
        }
      } catch (error) {
        toast.error(`Failed to update todo: ${error.message}`);
      }
    }
  };

  const handlePriorityChange = async (id, priority) => {
    try {
      const todo = todos.find((t) => t._id === id || t.id === id);
      if (!todo) return;

      const response = await todoAPI.updatePriority(
        todo._id || todo.id,
        priority
      );
      if (response.success) {
        await loadTodos(); // Reload to get updated data
        toast.success(`Priority changed to ${priority}`);
      }
    } catch (error) {
      toast.error(`Failed to update priority: ${error.message}`);
    }
  };

  // Since API handles filtering and sorting, we use todos directly
  const displayTodos = todos;

  const stats = {
    total: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
    completionRate:
      todos.length > 0
        ? Math.round(
            (todos.filter((t) => t.completed).length / todos.length) * 100
          )
        : 0,
  };

  const highPriorityActive = todos.filter(
    (t) => !t.completed && t.priority === "high"
  ).length;

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <Toaster position="top-right" />

      {/* Header */}
      <div className="border-b border-white/30">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <ListTodo className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl">My Tasks</h1>
                <p className="text-sm text-muted-foreground">
                  {stats.active} pending · {stats.completed} done
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="hidden md:flex gap-4">
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-200 shadow-sm min-w-[120px]">
                <div className="flex items-center gap-2 text-violet-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Completion</span>
                </div>
                <div className="text-2xl font-semibold text-violet-700">
                  {stats.completionRate}%
                </div>
              </div>

              {highPriorityActive > 0 && (
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl p-4 text-white shadow-lg shadow-rose-500/20 min-w-[120px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4" />
                    <span className="text-xs opacity-90">Urgent</span>
                  </div>
                  <div className="text-2xl">{highPriorityActive}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Bar */}
      <QuickAddBar onAdd={handleAddTodo} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Filters and View Toggle */}
        <div className="flex items-center justify-between">
          <Tabs value={filter} onValueChange={(v) => setFilter(v)}>
            <TabsList className="bg-white">
              <TabsTrigger value="all" className="gap-2">
                <ListTodo className="w-4 h-4" />
                All
                <span className="text-xs bg-gray-300 px-2 py-0.5 rounded-full border">
                  {stats.total}
                </span>
              </TabsTrigger>
              <TabsTrigger value="active" className="gap-2">
                <Circle className="w-4 h-4" />
                Active
                <span className="text-xs bg-gray-300 px-2 py-0.5 rounded-full border">
                  {stats.active}
                </span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Completed
                <span className="text-xs bg-gray-300 px-2 py-0.5 rounded-full border">
                  {stats.completed}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white border hover:bg-gray-50 gap-2"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setSortBy("recent")}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Recent first
                  {sortBy === "recent" && (
                    <span className="ml-auto text-violet-600">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Oldest first
                  {sortBy === "oldest" && (
                    <span className="ml-auto text-violet-600">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("priority")}>
                  <Flame className="w-4 h-4 mr-2" />
                  By priority
                  {sortBy === "priority" && (
                    <span className="ml-auto text-violet-600">✓</span>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle */}
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className={
                viewMode === "list"
                  ? "bg-violet-500 hover:bg-violet-600 text-white"
                  : "bg-white border hover:bg-gray-50"
              }
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className={
                viewMode === "grid"
                  ? "bg-violet-500 hover:bg-violet-600 text-white"
                  : "bg-white border hover:bg-gray-50"
              }
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Todo List */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 gap-3"
              : "space-y-3"
          }
        >
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full text-center py-16"
              >
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-violet-500" />
                <p className="text-muted-foreground">Loading your todos...</p>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full text-center py-16"
              >
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-xl mb-2 text-red-600">
                  Something went wrong
                </h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button
                  onClick={loadTodos}
                  className="bg-violet-500 hover:bg-violet-600"
                >
                  Try Again
                </Button>
              </motion.div>
            ) : displayTodos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full text-center py-16"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center">
                  {filter === "completed" ? (
                    <CheckCircle2 className="w-12 h-12 text-violet-500" />
                  ) : filter === "active" ? (
                    <Circle className="w-12 h-12 text-violet-500" />
                  ) : (
                    <ListTodo className="w-12 h-12 text-violet-500" />
                  )}
                </div>
                <h3 className="text-xl mb-2">
                  {filter === "completed"
                    ? "No completed tasks yet"
                    : filter === "active"
                    ? "All caught up!"
                    : "No tasks yet"}
                </h3>
                <p className="text-muted-foreground">
                  {filter === "completed"
                    ? "Complete some tasks to see them here"
                    : filter === "active"
                    ? "Great job! You've completed all your tasks"
                    : "Add your first task above to get started"}
                </p>
              </motion.div>
            ) : (
              displayTodos.map((todo) => (
                <TodoCard
                  key={todo._id || todo.id}
                  id={todo._id || todo.id}
                  {...todo}
                  onToggle={handleToggleTodo}
                  onDelete={handleDeleteTodo}
                  onEdit={handleEditTodo}
                  onPriorityChange={handlePriorityChange}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Progress Summary */}
        {todos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-medium text-gray-700">
                  Overall Progress
                </span>
              </div>
              <span className="text-sm text-gray-500 font-medium">
                {stats.completed} / {stats.total} tasks
              </span>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600 rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${stats.completionRate}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  boxShadow:
                    stats.completionRate > 0
                      ? "0 2px 4px rgba(139, 92, 246, 0.3)"
                      : "none",
                }}
              />
            </div>
            <div className="mt-3 text-center"></div>
          </motion.div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTodo} onOpenChange={() => setEditingTodo(null)}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl rounded-xl max-w-md mx-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-violet-600" />
              Edit Task
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            <div>
              <Label
                htmlFor="edit-text"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Task Description
              </Label>
              <Input
                id="edit-text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                placeholder="Enter your task description..."
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setEditingTodo(null)}
                className="px-4 py-2 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 rounded-lg transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
