const bcrypt = require('bcryptjs');
const db = require('_helpers/db');

module.exports = {
    login,
    getAll,
    getById,
    create,
    update,
    status,
    delete: _delete
};

// Login function
async function login({ email, password }) {
    const user = await db.User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        throw 'Email or password is incorrect';
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
    
    if (await db.User.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email +'" is already registered';
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

   
    Object.assign(user, params);
    await user.save();
}

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}


async function getUser(id) {
    const user = await db.User.findByPk(id);
    if (!user) throw 'User not found';
    return user;
}


async function status(id, newStatus) {
    const user = await getUser(id);

    if (!['Deactivate', 'Reactivate', 'Active'].includes(newStatus)) {
        throw 'Invalid status provided';
    }

    user.status = newStatus;
    await user.save();

    return user;
}