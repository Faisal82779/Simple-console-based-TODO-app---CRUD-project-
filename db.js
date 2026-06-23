// Loads database credentials from the .env file.
import 'dotenv/config';
// Imports Sequelize tools for database connection and model fields.
import { Sequelize, DataTypes } from 'sequelize';

// Creates the MySQL database connection using environment variables.
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        // Keeps console output focused on the assignment menus.
        logging: false,
    }
);

// Defines the User table fields required by the assignment.
const User = sequelize.define('User', {
    // Stores the unique user id.
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // Stores the user's full name.
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // Stores the user's unique email address.
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    // Stores the user's password.
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    // Uses the assignment table name for users.
    tableName: 'users',
    // Disables extra timestamp columns because the assignment lists only user fields.
    timestamps: false,
});

// Defines the Task table fields required by the assignment.
const Task = sequelize.define('Task', {
    // Stores the unique task id.
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // Stores the owner user id for the task.
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    // Stores the task title.
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // Stores the task description.
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    // Stores the due date in YYYY-MM-DD format.
    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    // Stores the task priority.
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        allowNull: false,
    },
    // Stores the task status.
    status: {
        type: DataTypes.ENUM('Pending', 'Completed'),
        allowNull: false,
        defaultValue: 'Pending',
    },
    // Stores when the task was created.
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    // Stores when the task was last updated.
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    // Uses the assignment table name for tasks.
    tableName: 'tasks',
    // Lets Sequelize manage createdAt and updatedAt fields.
    timestamps: true,
});

// Connects each user with their own tasks.
User.hasMany(Task, { foreignKey: 'userId' });
// Connects each task to one user.
Task.belongsTo(User, { foreignKey: 'userId' });

// Opens the database connection and syncs the assignment tables.
async function initDB() {
    // Verifies that the MySQL connection is working.
    await sequelize.authenticate();
    // Updates tables to match the assignment model structure.
    await sequelize.sync({ alter: true });
    // Confirms the database connection for the console user.
    console.log('Database connected Successfully');
}

// Closes the database connection after the app exits.
async function closeDB() {
    // Ends the Sequelize database connection.
    await sequelize.close();
    // Confirms that the connection has closed.
    console.log('Database connection closed');
}

// Exports the database connection, models, and connection helpers.
export { sequelize, User, Task, initDB, closeDB };
