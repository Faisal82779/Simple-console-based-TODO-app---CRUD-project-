// Imports database models used by the Todo app operations.
import { Op } from 'sequelize';
import { User, Task } from './db.js';

// Checks whether an email follows a basic valid email format.
function isValidEmail(email) {
    // Returns true only when the email has text before and after @ plus a domain.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Checks whether a date uses the required YYYY-MM-DD format.
function isValidDate(date) {
    // Stops invalid date formats before saving or updating tasks.
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date));
}

// Converts priority input to the exact allowed priority text.
function formatPriority(priority) {
    // Normalizes user input so high, HIGH, and High are treated the same.
    const value = priority.trim().toLowerCase();
    // Returns the matching assignment priority value.
    if (value === 'low') return 'Low';
    // Returns the matching assignment priority value.
    if (value === 'medium') return 'Medium';
    // Returns the matching assignment priority value.
    if (value === 'high') return 'High';
    // Returns null when the priority is invalid.
    return null;
}

// Converts status input to the exact allowed status text.
function formatStatus(status) {
    // Normalizes user input so pending, PENDING, and Pending are treated the same.
    const value = status.trim().toLowerCase();
    // Returns the matching assignment status value.
    if (value === 'pending') return 'Pending';
    // Returns the matching assignment status value.
    if (value === 'completed') return 'Completed';
    // Returns null when the status is invalid.
    return null;
}

// Registers a new user after applying assignment validation rules.
export async function registerUser(name, email, password) {
    // Rejects an empty name.
    if (!name.trim()) return { success: false, message: 'Name cannot be empty.' };
    // Rejects an invalid email format.
    if (!isValidEmail(email)) return { success: false, message: 'Invalid email format.' };
    // Rejects a password shorter than four characters.
    if (password.length < 4) return { success: false, message: 'Password must be at least 4 characters.' };
    // Searches for an existing user with the same email.
    const existingUser = await User.findOne({ where: { email } });
    // Rejects duplicate email registration.
    if (existingUser) return { success: false, message: 'Email already exists.' };
    // Saves the new user in the users table.
    await User.create({ name: name.trim(), email: email.trim(), password });
    // Returns the assignment success message.
    return { success: true, message: 'Registration successful!' };
}

// Logs in a registered user by email and password.
export async function loginUser(email, password) {
    // Finds the user by email.
    const user = await User.findOne({ where: { email } });
    // Shows the required invalid message when the email is not registered.
    if (!user) return { success: false, message: 'Invalid email or password.' };
    // Shows the required wrong credential message when the password is wrong.
    if (user.password !== password) return { success: false, message: 'Wrong credential' };
    // Returns the logged-in user for task menu actions.
    return { success: true, message: 'Login successful!', user };
}

// Adds a new task for the logged-in user.
export async function addTask(userId, title, description, dueDate, priority, status = 'Pending') {
    // Rejects an empty task title.
    if (!title.trim()) return { success: false, message: 'Task title cannot be empty.' };
    // Formats and validates the task priority.
    const validPriority = formatPriority(priority);
    // Rejects priority values outside Low, Medium, or High.
    if (!validPriority) return { success: false, message: 'Priority must be Low, Medium, or High.' };
    // Formats and validates the task status.
    const validStatus = formatStatus(status);
    // Rejects status values outside Pending or Completed.
    if (!validStatus) return { success: false, message: 'Status must be Pending or Completed' };
    // Rejects an invalid due date format.
    if (!isValidDate(dueDate)) return { success: false, message: 'Invalid date format.' };
    // Saves the task for the logged-in user.
    const task = await Task.create({ userId, title: title.trim(), description: description.trim(), dueDate, priority: validPriority, status: validStatus });
    // Returns the saved task and success message.
    return { success: true, message: 'Task added successfully!', task };
}

// Gets all tasks that belong to the logged-in user.
export async function getTasks(userId) {
    // Returns the user's tasks ordered by task id.
    return Task.findAll({ where: { userId }, order: [['id', 'ASC']] });
}

// Updates an existing task for the logged-in user.
export async function editTask(userId, taskId, updates) {
    // Rejects a task id that is not a valid number.
    if (!Number.isInteger(taskId) || taskId <= 0) return { success: false, message: 'Invalid task ID.' };
    // Finds the task by id and owner.
    const task = await Task.findOne({ where: { id: taskId, userId } });
    // Rejects editing when the task does not exist for this user.
    if (!task) return { success: false, message: 'Task not found.' };
    // Rejects an empty updated title.
    if (!updates.title.trim()) return { success: false, message: 'Task title cannot be empty.' };
    // Rejects an invalid updated due date.
    if (!isValidDate(updates.dueDate)) return { success: false, message: 'Invalid date format.' };
    // Formats and validates the updated priority.
    const validPriority = formatPriority(updates.priority);
    // Rejects invalid updated priority.
    if (!validPriority) return { success: false, message: 'Invalid priority.' };
    // Updates the task fields with validated values.
    await task.update({ title: updates.title.trim(), description: updates.description.trim(), dueDate: updates.dueDate, priority: validPriority });
    // Returns the updated task and success message.
    return { success: true, message: 'Task updated successfully!', task };
}

// Deletes a task after the console confirms yes.
export async function deleteTask(userId, taskId) {
    // Rejects a task id that is not a valid number.
    if (!Number.isInteger(taskId) || taskId <= 0) return { success: false, message: 'Invalid task ID.' };
    // Deletes only a task owned by the logged-in user.
    const deleted = await Task.destroy({ where: { id: taskId, userId } });
    // Shows task not found when no row was deleted.
    if (deleted === 0) return { success: false, message: 'Task not found.' };
    // Returns the assignment delete success message.
    return { success: true, message: 'Task deleted successfully!' };
}

// Searches the logged-in user's tasks by title or description.
export async function searchTasks(userId, keyword) {
    // Finds tasks where title or description contains the search keyword.
    return Task.findAll({
        where: {
            userId,
            [Op.or]: [
                { title: { [Op.like]: `%${keyword}%` } },
                { description: { [Op.like]: `%${keyword}%` } },
            ],
        },
        order: [['id', 'ASC']],
    });
}
