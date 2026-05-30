const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type : String,
        required : true
    },
    email: {
        type : String,
        required : true,
        unique : true
    },
    password: {
        type: String,
        required : true
    },
    specialty: {
        type : String,
        enum : ['Nurse', 'Doctor', 'Pharmacist', 'Support Staff'],
        default : null
    },
    verificationStatus: {
        type : String,
        enum : ['Pending', 'Approved', 'Rejected'],
        default : 'Pending'
    },
});

module.exports = mongoose.model('User', userSchema);

