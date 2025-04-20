// create a new thread
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Thread = require("../models/thread");
const User = require("../models/user");
const redis = require("../services/redis");
const { formatDate, formatDateTime } = require("../utils/helpers");
const is_author = require("../middleware/is_author");
const adminAuthenticate = require("../middleware/adminAuthentication");

router.get("/v1/users",adminAuthenticate, async (req, res) => {
  try {
    const users = await User.find({is_admin:false});
    const response = {
      users,
      success: true
    };

    res.status(200).send(response);
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.post("/v1/threads",adminAuthenticate, async (req, res) => {
    console.log('threads')
  try {
    const threads = await Thread.find({});
    const response = {
        threads,
      success: true
    };

    res.status(200).send(response);
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.delete("/v1/threads/:thread_id",adminAuthenticate, async (req, res) => {
  try {
    const response = await Thread.deleteOne({ _id: req.params.thread_id });

    res.status(200).send(response);
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.delete("/v1/threads/replay/:replay_id",adminAuthenticate, async (req, res) => {
  try {
    const response = await Thread.deleteOne({ _id: req.params.thread_id });

    res.status(200).send(response);
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.delete('/v1/users/:userId', adminAuthenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete the user
    await User.deleteOne({ _id: userId });

    // Delete threads authored by the user
    await Thread.deleteMany({ author: userId });

    // Remove all replies authored by the user from other threads
    await Thread.updateMany(
      { "replies.author": userId },
      { $pull: { replies: { author: userId } } }
    );

    res.status(200).json({ message: "User and their replies deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Error deleting user and their replies" });
  }
});


router.get("/v1/users/:userId/threads", adminAuthenticate, async (req, res) => {
  try {
    const userId = req.params.userId;
    const threads = await Thread.find({ "author": userId });
    res.status(200).json({ threads });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user threads" });
  }
});

router.get("/v1/users/:userId", adminAuthenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});


module.exports = router;
