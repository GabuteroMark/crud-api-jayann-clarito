const bcrypt = require('bcryptjs');
const db = require('_helpers/db');

// Define the Status constants
const Status = {
    Deactivate: 'Deactivate',
    Reactivate: 'Reactivate',
    Activate: 'Activate'
};

module.exports = {
    login,
    getAll,
    getById,
    create,
    update,
    deactivate,
    activate,
    status,
    delete: _delete
};

// Login function
async function login({ email, password }) {
    const user = await db.User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        throw new Error('Email or password is incorrect');
    }

    return user;
}

async function getAll() {
    return await db.User.findAll();
}

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    // Check if email is already registered
    if (await db.User.findOne({ where: { email: params.email } })) {
        throw new Error('Email "' + params.email + '" is already registered');
    }

   
    const user = new db.User(params);


    user.passwordHash = await bcrypt.hash(params.password, 10);

    
    await user.save();
}

async function update(id, params) {
    const user = await getUser(id);

    
    if (params.password) {
        params.passwordHash = await bcrypt.hash(params.password, 10);
        delete params.password; 
    }

    // Update user with new params and save
    Object.assign(user, params);
    await user.save();
}

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}

// Helper function to get user by ID
async function getUser(id) {
    const user = await db.User.findByPk(id);
    if (!user) throw new Error('User not found');
    return user;
}

// Function to deactivate user
async function deactivate(id) {
    const user = await getUser(id);

    // Set status to 'Deactivate'
    user.status = Status.Deactivate;
    await user.save();

    return user;
}

// Function to Activate user
async function activate(id) {
    const user = await getUser(id);

    // Set status to 'Activate'
    user.status = Status.Activate;
    await user.save();

    return user;
}

// Function to update user status (Activate, Deactivate, Reactivate)
async function status(id, newStatus) {
    const user = await getUser(id);

    // Check if the provided status is valid
    if (![Status.Deactivate, Status.Reactivate, Status.Active].includes(newStatus)) {
        throw new Error('Invalid status provided');
    }

    // Update the user's status
    user.status = newStatus;
    await user.save();

    return user;
}
