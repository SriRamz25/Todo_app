import { useState } from "react";
import { Plus, Zap } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function QuickAddBar({ onAdd }) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim(), priority);
      setText("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky top-0 z-10 border-y border-white/40 bg-white/10 backdrop-blur-md shadow-lg p-4"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Set priority & Quick add a task..."
              className="pr-12 h-12 bg-white border-2"
            />
            <Zap className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>

          {/* Priority Pills */}
          <div className="flex gap-1 bg-white p-1 rounded-lg border">
            <button
              type="button"
              onClick={() => setPriority("low")}
              className={`px-3 py-2 rounded-md text-sm transition-all ${
                priority === "low"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Low
            </button>
            <button
              type="button"
              onClick={() => setPriority("medium")}
              className={`px-3 py-2 rounded-md text-sm transition-all ${
                priority === "medium"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Med
            </button>
            <button
              type="button"
              onClick={() => setPriority("high")}
              className={`px-3 py-2 rounded-md text-sm transition-all ${
                priority === "high"
                  ? "bg-red-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              High
            </button>
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-12 bg-violet-500 hover:bg-violet-600 text-white"
          >
            <Plus className="w-5 h-5 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </form>
  );
}
