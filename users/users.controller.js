const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const Role = require('_helpers/role');
const userService = require('./user.service');

// Define or import status constants
const Status = {
    Deactivate: 'Deactivate',
    Reactivate: 'Reactivate',
    Activate: 'Activate'
};

// Added login route
router.post('/login', login);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

// Added profile endpoint
router.get('/profile/:id', getById);
router.put('/profile/:id', updateSchema, update);

// Route to handle status update (deactivation, reactivation, activation)
router.post('/status/:id', updateStatus);
router.put('/status/:id', updateStatus);

//route for deactivate
router.post('/users/:id/deactivate', (req, res, next) => {
    userService.deactivate(req.params.id)
        .then(user => res.json({ message: 'User deactivated', user }))
        .catch(next);
});
router.put('/:userId/deactivate', deactivateUser);

//route for activate
router.post('/users/:id/activate', (req, res, next) => {
    userService.activate(req.params.id)
        .then(user => res.json({ message: 'User Activated', user }))
        .catch(next);
});
router.put('/:userId/activate', activateUser);

module.exports = router;

// Added login function
function login(req, res, next) {
    userService.login(req.body)
    .then(user => res.json(user))
    .catch(next);
}

function getAll(req, res, next) {
    userService.getAll()
    .then(users => res.json(users))
    .catch(next);
}

function getById(req, res, next) {
    userService.getById(req.params.id)
    .then(user => res.json(user))
    .catch(next);
}

function create(req, res, next) {
    userService.create(req.body)
    .then(() => res.json({ message: 'User created' }))
    .catch(next);
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
    .then(() => res.json({ message: 'User updated' }))
    .catch(next);
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
    .then(() => res.json({ message: 'User deleted' }))
    .catch(next);
}

// Function to update user status
function updateStatus(req, res, next) {
    const { status } = req.body;

    if (![Status.Deactivate, Status.Reactivate, Status.Active].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    userService.updateStatus(req.params.id, status)
    .then(() => res.json({ message: `User ${status.toLowerCase()}d` }))
    .catch(next);
}

function createSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        role: Joi.string().valid(Role.Admin, Role.User).required(),
        status: Joi.string().valid(Status.Deactivate, Status.Reactivate, Status.Activate).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    });
    validateRequest(req, next, schema);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().empty(''),
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        role: Joi.string().valid(Role.Admin, Role.User).empty(''),
        status: Joi.string().valid(Status.Deactivate, Status.Reactivate, Status.Activate).empty(''),
        email: Joi.string().email().empty(''),
        password: Joi.string().min(6).empty(''),
        confirmPassword: Joi.string().valid(Joi.ref('password')).empty('')
    }).with('password', 'confirmPassword');
    validateRequest(req, next, schema);
}

function deactivateUser(req, res, next) {
    userService.deactivate(req.params.userId)
        .then(() => res.json({ message: 'User Deactivated Successfully.' }))
        .catch(next);
}

function activateUser(req, res, next) {
    userService.activate(req.params.userId)
        .then(() => res.json({ message: 'User Activated Successfully.' }))
        .catch(next);
}
