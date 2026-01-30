import { taskAPI } from '@/lib/api';

/**
 * Checks if a string is a valid UUID
 * @param id The string to check
 * @returns True if it's a valid UUID, false otherwise
 */
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Maps a user-friendly task index (1-based) to the actual UUID
 * @param input The user input - either a number (index) or UUID string
 * @returns The actual UUID string or null if not found
 */
export const mapTaskInputToUUID = async (input: string): Promise<string | null> => {
  try {
    // Check if input is already a valid UUID
    if (isValidUUID(input)) {
      return input; // Already a UUID, return as-is
    }

    // Try to parse as a number (user-friendly index)
    const index = parseInt(input, 10);
    if (isNaN(index)) {
      return null; // Invalid input
    }

    // Get all tasks to map the index to the UUID
    const tasks = await taskAPI.getAll();

    // Adjust for 0-based indexing
    const taskIndex = index - 1;

    if (taskIndex >= 0 && taskIndex < tasks.length) {
      return tasks[taskIndex].id;
    }

    return null;
  } catch (error) {
    console.error('Error mapping task input to UUID:', error);
    return null;
  }
};

/**
 * Maps a user-friendly task index (1-based) to the actual UUID
 * @param index The user-friendly index (1-based)
 * @returns The actual UUID string or null if not found
 */
export const mapTaskIndexToUUID = async (index: number): Promise<string | null> => {
  return mapTaskInputToUUID(index.toString());
};

/**
 * Gets all tasks and returns them with their 1-based indices
 * @returns Array of tasks with their indices
 */
export const getTasksWithIndices = async (): Promise<Array<{index: number, task: any}>> => {
  try {
    const tasks = await taskAPI.getAll();
    return tasks.map((task, idx) => ({
      index: idx + 1, // 1-based indexing for user-friendliness
      task
    }));
  } catch (error) {
    console.error('Error getting tasks with indices:', error);
    return [];
  }
};