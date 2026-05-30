const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  facilityId: {
    type: String,
    required: true
  },
  requiredSpecialty: {
    type: String,
    enum: ['Nurse', 'Doctor', 'Pharmacist', 'Support Staff'],
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  payRate: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Assigned', 'Completed'],
    default: 'Open'
  },
  applicants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

module.exports = mongoose.model('Shift', shiftSchema);