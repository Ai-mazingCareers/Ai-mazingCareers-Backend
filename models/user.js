const mongoose = require('mongoose');
const { estimatedDocumentCount } = require('./resume');

const userSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
        },
        email:{
            type: String,
            required: true,
            unique: true,
        },
        password:{
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    });

    const User = mongoose.model( 'user-info', userSchema);

    module.exports = User;