// Imports readline to collect input from the console user.
import readline from 'readline/promises';
// Imports stdin and stdout so readline can read and write in the terminal.
import { stdin as input, stdout as output } from 'process';
// Imports database helpers to open and close the app database connection.
import { initDB, closeDB } from './db.js';
// Imports the assignment use case functions for users and tasks.
import { addTask, deleteTask, editTask, getTasks, loginUser, registerUser, searchTasks } from './index.js';

// Stores the console input reader after the database is ready.
let rl;

// Prints one task using the assignment display format.
function printTask(task) {
    // Shows the task id.
    console.log(`ID: ${task.id}`);
    // Shows the task title.
    console.log(`Title: ${task.title}`);
    //Showw the task description
    console.log(`Description: ${task.description}`);
    // Shows the task due date.
    console.log(`Due Date: ${task.dueDate}`);
    // Shows the task priority.
    console.log(`Priority: ${task.priority}`);
    // Shows the task status.
    console.log(`Status: ${task.status}`);
}

// Prints every task or the required empty state.
function printTaskList(tasks, heading) {
    // Shows the section heading before the task list.
    console.log(`\n${heading}`);
    // Shows the required empty state when no task exists.
    if (tasks.length === 0) {
        console.log('\nNo tasks found.');
        return;
    }
    // Prints each task with a blank line between tasks.
    tasks.forEach((task) => {
        console.log('');
        printTask(task);
    });
}

// Reads the user registration fields and creates an account.
async function registerFlow() {
    // Asks for the user's name.
    const name = await rl.question('\nEnter your name:\n');
    // Asks for the user's email.
    const email = await rl.question('\nEnter your email:\n');
    // Asks for the user's password.
    const password = await rl.question('\nEnter your password:\n');
    // Registers the user with validation.
    const result = await registerUser(name, email, password);
    // Shows the registration result message.
    console.log(`\n${result.message}`);
}

// Reads login credentials and returns the logged-in user.
async function loginFlow() {
    // Asks for the login email.
    const email = await rl.question('\nEnter your email:\n');
    // Asks for the login password.
    const password = await rl.question('\nEnter your password:\n');
    // Attempts to log in with the provided credentials.
    const result = await loginUser(email, password);
    // Shows the login result message.
    console.log(`\n${result.message}`);
    // Returns the user when login succeeds.
    return result.success ? result.user : null;
}

// Reads task fields and adds a task for the logged-in user.
async function addTaskFlow(user) {
    // Asks for the task title.
    const title = await rl.question('\nEnter task title:\n');
    // Asks for the task description.
    const description = await rl.question('\nEnter task description:\n');
    // Asks for the task due date.
    const dueDate = await rl.question('\nEnter due date:\n');
    // Asks for the task priority.
    const priority = await rl.question('\nEnter priority:\n');
    // Adds the task with default Pending status.
    const result = await addTask(user.id, title, description, dueDate, priority);
    // Shows the add task result message.
    console.log(`\n${result.message}`);
}

// Loads and prints all tasks for the logged-in user.
async function viewTasksFlow(user) {
    // Gets all tasks for this user.
    const tasks = await getTasks(user.id);
    // Prints tasks using the required list format.
    printTaskList(tasks, 'Your Tasks:');
}

// Reads task update fields and edits an existing task.
async function editTaskFlow(user) {
    // Asks which task should be edited.
    const taskIdInput = await rl.question('\nEnter task ID to edit:\n');
    // Converts the entered id to a number.
    const taskId = Number(taskIdInput);
    // Shows invalid id when the input is not a positive number.
    if (!Number.isInteger(taskId) || taskId <= 0) {
        console.log('\nInvalid task ID.');
        return;
    }
    // Gets the user's tasks to find the current values.
    const tasks = await getTasks(user.id);
    // Finds the selected task for showing current values.
    const currentTask = tasks.find((task) => task.id === taskId);
    // Shows task not found before asking update fields.
    if (!currentTask) {
        console.log('\nTask not found.');
        return;
    }
    // Shows the current title.
    console.log(`\nCurrent Title: ${currentTask.title}`);
    // Asks for the new title.
    const title = await rl.question('Enter new title:\n');
    // Shows the current description.
    console.log(`\nCurrent Description: ${currentTask.description}`);
    // Asks for the new description.
    const description = await rl.question('Enter new description:\n');
    // Shows the current due date.
    console.log(`\nCurrent Due Date: ${currentTask.dueDate}`);
    // Asks for the new due date.
    const dueDate = await rl.question('Enter new due date:\n');
    // Shows the current priority.
    console.log(`\nCurrent Priority: ${currentTask.priority}`);
    // Asks for the new priority.
    const priority = await rl.question('Enter new priority:\n');
    // Updates the task with validated input.
    const result = await editTask(user.id, taskId, { title, description, dueDate, priority });
    // Shows the edit task result message.
    console.log(`\n${result.message}`);
}

// Reads task id and deletes a confirmed task.
async function deleteTaskFlow(user) {
    // Asks which task should be deleted.
    const taskIdInput = await rl.question('\nEnter task ID to delete:\n');
    // Converts the entered id to a number.
    const taskId = Number(taskIdInput);
    // Shows invalid id before asking delete confirmation.
    if (!Number.isInteger(taskId) || taskId <= 0) {
        console.log('\nInvalid task ID.');
        return;
    }
    // Asks for delete confirmation.
    const confirmation = await rl.question('\nAre you sure you want to delete this task? yes/no\n');
    // Cancels deletion when the user does not type yes.
    if (confirmation.trim().toLowerCase() !== 'yes') {
        console.log('\nDelete cancelled.');
        return;
    }
    // Deletes the task after confirmation.
    const result = await deleteTask(user.id, taskId);
    // Shows the delete task result message.
    console.log(`\n${result.message}`);
}

// Reads a keyword and searches the logged-in user's tasks.
async function searchTasksFlow(user) {
    // Asks for the search keyword.
    const keyword = await rl.question('\nEnter search keyword:\n');
    // Searches tasks by title or description.
    const tasks = await searchTasks(user.id, keyword);
    // Shows the required empty search result message.
    if (tasks.length === 0) {
        console.log('\nNo matching tasks found.');
        return;
    }
    // Prints matching tasks using the required result heading.
    printTaskList(tasks, 'Search Result:');
}

// Shows the logged-in Todo menu until logout.
async function todoMenu(user) {
    // Keeps the Todo menu active until the user logs out.
    while (true) {
        // Prints the assignment Todo menu.
        console.log('\nTodo Menu\n');
        console.log('1. Add Task');
        console.log('2. View All Tasks');
        console.log('3. Edit Task');
        console.log('4. Delete Task');
        console.log('5. Search Tasks');
        console.log('6. Logout');
        // Reads the Todo menu choice.
        const choice = await rl.question('\nEnter your choice:\n');
        // Runs add task flow.
        if (choice === '1') await addTaskFlow(user);
        // Runs view tasks flow.
        else if (choice === '2') await viewTasksFlow(user);
        // Runs edit task flow.
        else if (choice === '3') await editTaskFlow(user);
        // Runs delete task flow.
        else if (choice === '4') await deleteTaskFlow(user);
        // Runs search tasks flow.
        else if (choice === '5') await searchTasksFlow(user);
        // Returns to the main menu after logout.
        else if (choice === '6') return;
        // Shows a simple message for an invalid menu choice.
        else console.log('\nInvalid choice.');
    }
}

// Shows the main menu until the user exits.
async function mainMenu() {
    // Keeps the main menu active until Exit is selected.
    while (true) {
        // Prints the assignment main menu.
        console.log('\nWelcome to Todo App\n');
        console.log('1. Register');
        console.log('2. Login');
        console.log('3. Exit');
        // Reads the main menu choice.
        const choice = await rl.question('\nEnter your choice:\n');
        // Runs registration flow.
        if (choice === '1') await registerFlow();
        // Runs login flow and opens Todo menu on success.
        else if (choice === '2') {
            // Attempts login and stores the logged-in user.
            const user = await loginFlow();
            // Opens the Todo menu after successful login.
            if (user) await todoMenu(user);
        }
        // Exits the app.
        else if (choice === '3') return;
        // Shows a simple message for an invalid menu choice.
        else console.log('\nInvalid choice.');
    }
}

// Starts the Todo app and safely closes resources when finished.
try {
    // Opens and syncs the database before showing menus.
    await initDB();
    // Creates one console input reader for the whole app.
    rl = readline.createInterface({ input, output });
    // Runs the main assignment menu.
    await mainMenu();
} finally {
    // Closes the console input reader when it was created.
    if (rl) rl.close();
    // Closes the database connection.
    await closeDB();
}
