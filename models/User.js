const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  account: { type: String, required: true, enum: ['student', 'sensei'] },
});

module.exports = mongoose.model('User', userSchema);
