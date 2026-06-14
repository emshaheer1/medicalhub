const mongoose = require('mongoose');

const phlebotomyAgreementSchema = new mongoose.Schema(
  {
    name: String,
    add: String,
    city: String,
    phoneH: String,
    phoneC: String,
    phoneW: String,
    email: String,
    social: String,
    date: String,
    emergency: String,
    relation: String,
    tele: String,
    sign: String,
    student1: String,
    student2: String,
    student3: String,
    student4: String,
    student5: String,
    student6: String,
    student7: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('PhlebotomyAgreement', phlebotomyAgreementSchema);
