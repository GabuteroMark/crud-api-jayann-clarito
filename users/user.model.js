const bcrypt = require('bcryptjs');
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const attributes = {
        email: { type: DataTypes.STRING, allowNull: false },
        passwordHash: { type: DataTypes.STRING, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        role: { type: DataTypes.STRING, allowNull: false },
        status: {type: DataTypes.STRING}
    };
    
    const options = {
        defaultScope: {
            attributes: { exclude: ['passwordHash'] }
        },
        scopes: {
            withHash: { attributes: {} }
        }
    };
    
    const User = sequelize.define('User', attributes, options);

    User.prototype.validPassword = function (password) {
        if (!this.passwordHash) {
            throw new Error("Password Hash is undefined");
        }
        return bcrypt.compareSync(password, this.passwordHash);
    }

    return User;
}