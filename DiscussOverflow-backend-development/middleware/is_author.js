const Thread = require("../models/thread");

const is_author = async (req, res, next) => {
  try {

    const { threadId } = req.params;

    if (!req?.user?._id || !threadId) {
      return res.status(400).send({message: "Bad request"});
    }

    const thread = await Thread.findById(threadId);

    if (!thread || thread.author.toString() !== req.user._id.toString()) {
      return res.status(400).send({ message: "Bad request" });
    }
    req.thread = thread;
    next();
  } catch (error) {
    res.status(403).json({ error: "Permission denied" });
  }
};

module.exports = is_author;
