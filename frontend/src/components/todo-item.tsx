'use client';

import { useState, useEffect } from 'react';
import { Trash2, SquarePen, CheckCheck } from 'lucide-react';

interface TodoItem {
  id: number | string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  tags?: string[] | string; // Can be array or string
  due_date?: string;
}

interface TodoItemProps {
  todo: TodoItem;
  onToggle: (id: number | string) => void;
  onDelete: (id: number | string) => void;
  onUpdate: (id: number | string, title: string) => void;
}

const TodoItem = ({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleSave = () => {
    if (editValue.trim()) {
      onUpdate(todo.id, editValue);
      setIsEditing(false);
    }
  };

  const priorityColors = {
    low: 'border-[#F5F5DC]/20 bg-[#F5F5DC]/5',
    medium: 'border-[#F5F5DC]/50 bg-[#F5F5DC]/10',
    high: 'border-[#F5F5DC] bg-[#F5F5DC]/15',
  };

  const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  };

  // Helper function to format and display tags
  const displayTags = () => {
    if (!todo.tags) return null;

    // Handle both string and array formats for tags
    const tagsArray = typeof todo.tags === 'string'
      ? todo.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : Array.isArray(todo.tags)
        ? todo.tags
        : [];

    if (tagsArray.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {tagsArray.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-0.5 bg-[#F5F5DC]/20 text-[#F5F5DC] text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

  // Helper function to format and display due date
  const displayDueDate = () => {
    if (!todo.due_date) return null;

    try {
      const date = new Date(todo.due_date);
      // Check if the date is valid
      if (isNaN(date.getTime())) return null;

      // Only format the date on the client side to prevent hydration errors
      if (!hasMounted) {
        return (
          <div className="text-xs text-[#F5F5DC]/70 mt-1">
            Due: Loading...
          </div>
        );
      }

      // Format as readable date/time using local timezone
      return (
        <div className="text-xs text-[#F5F5DC]/70 mt-1" suppressHydrationWarning>
          Due: {date.toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })}
        </div>
      );
    } catch (error) {
      return null;
    }
  };

  return (
    <div
      className={`flex flex-col p-4 rounded-lg border ${priorityColors[todo.priority]} mb-3`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
              className="mr-4 px-3 py-1 bg-black border border-[#F5F5DC]/30 rounded text-[#F5F5DC] flex-grow"
            />
          ) : (
            <>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
                className="w-5 h-5 mr-4 mt-0.5 rounded bg-black/20 border-[#F5F5DC]/30 accent-[#F5F5DC]"
              />
              <div>
                <span
                  className={`${todo.completed ? 'line-through text-[#F5F5DC]/50' : 'text-[#F5F5DC]'}`}
                  onDoubleClick={() => setIsEditing(true)}
                >
                  {todo.title}
                </span>
                {displayTags()}
                {displayDueDate()}
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            todo.priority === 'high' ? 'bg-[#F5F5DC] text-black' :
            todo.priority === 'medium' ? 'bg-[#F5F5DC]/50 text-black' :
            'bg-[#F5F5DC]/20 text-[#F5F5DC]'
          }`}>
            {priorityLabels[todo.priority]}
          </span>
          {!isEditing ? (
            <div className="flex space-x-1 mt-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-[#F5F5DC]/70 hover:text-[#F5F5DC] transition-colors p-1 rounded hover:bg-[#F5F5DC]/10"
                aria-label="Edit task"
              >
                <SquarePen size={16} />
              </button>
              <button
                onClick={() => onDelete(todo.id)}
                className="text-[#F5F5DC]/70 hover:text-red-400 transition-colors p-1 rounded hover:bg-[#F5F5DC]/10"
                aria-label="Delete task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSave}
              className="text-[#F5F5DC]/70 hover:text-green-400 transition-colors p-1 rounded hover:bg-[#F5F5DC]/10 mt-2"
              aria-label="Save task"
            >
              <CheckCheck size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoItem;