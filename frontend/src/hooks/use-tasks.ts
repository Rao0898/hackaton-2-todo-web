'use client';

import { useState, useEffect } from "react";
import { Task } from "@/types/task";
import { taskAPI } from "@/lib/api";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskAPI.getAll();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const createTask = async (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => {
    try {
      const newTask = await taskAPI.create(taskData);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
      throw err;
    }
  };

  // Update an existing task
  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      const updatedTask = await taskAPI.update(id, taskData);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
      throw err;
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    try {
      await taskAPI.delete(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      throw err;
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (id: string) => {
    try {
      const updatedTask = await taskAPI.toggleComplete(id);
      setTasks(prev => prev.map(task =>
        task.id === id ? updatedTask : task
      ));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle task completion");
      throw err;
    }
  };

  // Search tasks
  const searchTasks = async (query: string) => {
    try {
      setLoading(true);
      const data = await taskAPI.search(query);
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search tasks");
      console.error("Error searching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    searchTasks,
  };
};