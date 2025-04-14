// create a new thread
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Thread = require("../models/thread");
const User = require("../models/user");
const redis = require("../services/redis");
const { formatDate, formatDateTime } = require("../utils/helpers");
const is_author = require("../middleware/is_author");

router.post("/v1/users", async (req, res) => {
    console.log('users')
  try {
    const users = await User.find({});
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

router.post("/v1/threads", async (req, res) => {
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

router.delete("/v1/threads/:thread_id", async (req, res) => {
  try {
    const response = await Thread.deleteOne({ _id: req.params.thread_id });

    res.status(200).send(response);
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.delete("/v1/threads/replay/:replay_id", async (req, res) => {
  try {
    const response = await Thread.deleteOne({ _id: req.params.thread_id });

    res.status(200).send(response);
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: "Something went wrong" });
  }
});



module.exports = router;
