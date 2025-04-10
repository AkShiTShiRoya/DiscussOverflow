const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  createDate: { type: Date, default: Date.now, index: true}, // this index will help us optimize sort by createDate results
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  views: {
    type: Map,
    of: Number,
    default: {},
  },
  reach: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      content: {type: String, required: true},
      likes:  {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        default: [],
      },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      date: { type: Date, default: Date.now },
      is_answer: { type: Boolean, default: false }
    },
  ],
}, { autoIndex: false });

module.exports = mongoose.model("Thread", threadSchema);
