import { useState } from "react";
import {
  Check,
  MoreVertical,
  Clock,
  Flag,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { motion } from "motion/react";
import { Checkbox } from "./ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const priorityConfig = {
  low: {
    color: "text-blue-600",
    bg: "bg-blue-50",
    borderColor: "border-l-blue-400",
    badge: "bg-blue-100 text-blue-700",
  },
  medium: {
    color: "text-orange-600",
    bg: "bg-orange-50",
    borderColor: "border-l-orange-400",
    badge: "bg-orange-100 text-orange-700",
  },
  high: {
    color: "text-red-600",
    bg: "bg-red-50",
    borderColor: "border-l-red-400",
    badge: "bg-red-100 text-red-700",
  },
};

export function TodoCard({
  id,
  text,
  completed,
  priority,
  category,
  dueDate,
  createdAt,
  completedAt,
  onToggle,
  onDelete,
  onEdit,
  onPriorityChange,
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Ensure priority has a fallback and config exists
  const safePriority = priority || "medium";
  const config = priorityConfig[safePriority] || priorityConfig.medium;

  // Format creation date
  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative bg-white rounded-xl border border-gray-200 border-l-4 ${
        config.borderColor
      } transition-all duration-200 hover:shadow-lg hover:shadow-gray-200 ${
        completed ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <div className="pt-0.5">
          <Checkbox
            checked={completed}
            onCheckedChange={() => onToggle(id)}
            className="h-5 w-5 rounded-full border-2 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-violet-500 data-[state=checked]:to-purple-600 data-[state=checked]:border-purple-500"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div
            onClick={() => !completed && onEdit(id)}
            className={`cursor-pointer ${completed ? "line-through" : ""}`}
          >
            {text}
          </div>

          {/* Meta info */}
          {(category || dueDate || createdAt || completedAt) && (
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {createdAt && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Created {formatDate(createdAt)}
                </div>
              )}
              {completed && completedAt && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="w-3 h-3" />
                  Completed {formatDate(completedAt)}
                </div>
              )}
              {category && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  {category}
                </div>
              )}
              {dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {dueDate}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Priority Badge */}
        <div
          className={`${config.badge} px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1`}
        >
          <Flag className="w-3 h-3" />
          {priority}
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`p-1 rounded-md hover:bg-gray-100 ${
                isHovered ? "opacity-100" : "opacity-100"
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(id)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPriorityChange(id, "low")}>
              Set Low Priority
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPriorityChange(id, "medium")}>
              Set Medium Priority
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPriorityChange(id, "high")}>
              Set High Priority
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(id)}
              className="text-red-600 focus:text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Progress bar for completed state */}
      {completed && (
        <motion.div
          layoutId={`complete-${id}`}
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600 rounded-b-xl"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
}
