const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Thread = require("../models/thread");
const User = require("../models/user");
const redis = require("../services/redis");
const { formatDate, formatDateTime } = require("../utils/helpers");
const is_author = require("../middleware/is_author");

// create a new thread
router.post("/v1/thread", async (req, res) => {
  try {
    const { title, content } = req.body;
    const user = req.user;

    const thread = new Thread({
      title: title,
      content: content,
      author: user._id,
    });
    const result = await thread.save();
    const response = {
      ...result.toObject(),
      createDate: formatDateTime(result.createDate),
    };

    // delete all cached threads lists
    let cursor = "0";
    let keysToDelete = [];

    do {
      const [newCursor, scannedKeys] = await redis.scan(
        cursor,
        "MATCH",
        "threads?*"
      );
      cursor = newCursor;
      keysToDelete.push(...scannedKeys);
    } while (cursor !== "0");

    if (keysToDelete.length > 0) {
      // Use a pipeline to efficiently delete the keys
      const pipeline = redis.pipeline();
      keysToDelete.forEach((key) => pipeline.del(key));
      await pipeline.exec();
      // console.log(`Deleted ${keysToDelete.length} keys.`);
    } else {
      // console.log(`No keys matched the prefix "${prefix}".`);
    }

    res.status(201).send(response);
  } catch (err) {
    res.status(500).send({ message: "Something went wrong" });
  }
});

// get a thread
router.get("/v1/thread/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // aggregate pipeline
    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorData",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "replies.author",
          foreignField: "_id",
          as: "authorDetails",
        },
      },
      {
        $unwind: "$authorData",
      },
      // {
      //   $unwind: {
      //     path: "$authorDetails",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $addFields: {
          views: { $objectToArray: "$views" },
          liked: {
            $in: [new mongoose.Types.ObjectId(user._id), "$likes"],
          },
          replies: {
            $map: {
              input: {
                $cond: [
                  { $isArray: "$replies" },
                  "$replies",
                  [],
                ],
              },
              as: "reply",
              in: {
                _id: "$$reply._id",
                content: "$$reply.content",
                date: "$$reply.date",
                likes: "$$reply.likes",
                is_answer: "$$reply.is_answer",
                likesCount: {
                  $cond: {
                    if: { $isArray: "$$reply.likes" },
                    then: { $size: "$$reply.likes" },
                    else: 0,
                  },
                },
                liked: {
                  $in: [
                    new mongoose.Types.ObjectId(user._id),
                    {
                      $cond: {
                        if: { $isArray: "$$reply.likes" },
                        then: "$$reply.likes",
                        else: [],
                      },
                    },
                  ],
                },
                author: {
                  $let: {
                    vars: { authorId: "$$reply.author" },
                    in: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$authorDetails",
                            as: "authorDetail",
                            cond: { $eq: ["$$authorDetail._id", "$$authorId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                },
              },
            },
          },
          
        },
      },
      {
        $project: {
          title: 1,
          content: 1,
          createDate: 1,
          views: {
            $sum: "$views.v",
          },
          reach: {
            $size: "$reach",
          },
          likes: {
            $size: "$likes",
          },
          liked: 1,
          author: {
            _id: "$authorData._id",
            username: "$authorData.username",
          },
          replies: {
            $map: {
              input: "$replies", // Assuming 'replies' is the field containing the list of replies
              as: "reply",
              in: {
                author: {
                  _id: "$$reply.author._id", // Access _id field within author
                  username: "$$reply.author.username", // Access username field within author
                },
                _id: "$$reply._id",
                content: "$$reply.content",
                date: "$$reply.date",
                liked: "$$reply.liked",
                likesCount: "$$reply.likesCount",
                is_answer: "$$reply.is_answer"
              },
            },
          },
        },
      },
    ];

    // const cachedData = await redis.get(`thread?id=${id}`);

    // if (cachedData) {
    //   const data = JSON.parse(cachedData);
    //   res.status(200).send(data);
    // } else {
      const result = await Thread.aggregate(pipeline);
      const transformedThread = result[0];
      console.log('transformedThread :', transformedThread);

      if (transformedThread) {
        response = {
          ...transformedThread,
          createDate: formatDateTime(transformedThread.createDate),
          replies: transformedThread.replies.map((reply) => {
            return {
              ...reply,
              date: formatDateTime(reply.date),
            };
          }),
        };
        res.status(200).send(response);
        await redis.set(`thread?id=${id}`, JSON.stringify(response));
      } else {
        console.log("Thread not found.");
        res.status(404).send({ message: "Thread not found!" });
        return;
      }
    // }

    // Update thead's reach and views
    const trackRecord = await Thread.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: {
          reach: user._id,
        },
        $inc: {
          [`views.${today}`]: 1,
        },
      },
      { new: true }
    );

    // Add thread to user's visited threads list
    const userRecordUpdate = await User.findByIdAndUpdate(user._id, {
      $addToSet: {
        visitedThreads: req.params.id,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Something went wrong" });
  }
});

// get a list of threads
router.get("/v1/thread", async (req, res) => {
  try {
    const { page = 1, limit = 15, filter = "all" } = req.query;
    if (!["all", "top", "unseen"].includes(filter)) {
      res.status(400).send({ message: "Invalid filter" });
      return;
    }
    const skip = (page - 1) * limit;
    let sortObject = { createDate: -1 };
    let additionalFilter = [];

    if (filter === "top") {
      sortObject = { likes: -1, createDate: -1 };
    } else if (filter === "unseen") {
      additionalFilter = [
        {
          $match: {
            _id: { $nin: req.user.visitedThreads },
          },
        },
      ];
    }

    // if (filter) {
    //   var filterDate = new Date();
    //   filterDate.setHours(0, 0, 0, 0);
    // } else {
    //   filterDate = undefined;
    // }

    // aggregate pipeline
    const pipeline = additionalFilter.concat([
      // {
      //   $match: {
      //     createDate: { $gte: new Date(filterDate) },
      //   },
      // },
      {
        $addFields: {
          reach: { $size: "$reach" },
          likes: { $size: "$likes" },
          replies: { $size: "$replies" },
        },
      },
      {
        $sort: sortObject,
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorData",
        },
      },
      {
        $addFields: {
          authorData: {
            $arrayElemAt: ["$authorData", 0],
          },
          views: { $objectToArray: "$views" },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          author: {
            _id: "$authorData._id",
            username: "$authorData.username",
          },
          views: {
            $sum: "$views.v",
          },
          reach: 1,
          likes: 1,
          replies: 1,
          createDate: {
            $ifNull: ["$createDate", new Date()],
          },
        },
      },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    // fetch cached data from redis if available
    // const cachedData = await redis.get(
    //   `threads?page=${page}&limit=${limit}&filter=${filter}`
    // );

    // // check for cached data
    // if (cachedData) {
    //   // Add other fields from the reply object as needed
    //   const data = JSON.parse(cachedData);
    //   res.status(200).send(data);
    // } else {
    const threads = await Thread.aggregate(pipeline);
    const data = threads.map((thread) => {
      return {
        ...thread,
        createDate: formatDateTime(thread.createDate),
      };
    });
    return res.status(200).send(data);

    // set result in redis cache
    // await redis.setex(
    //   `threads?page=${page}&limit=${limit}&filter=${filter}`,
    //   10,
    //   JSON.stringify(data)
    // );
    // }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Something went wrong" });
  }
});

// reply on a thread
router.post("/v1/thread/reply", async (req, res) => {
  try {
    const user = req.user;
    const { threadId, content } = req.body;

    if (!user || !user._id) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    if (!threadId || !content) {
      return res.status(400).send({ message: "Missing threadId or content" });
    }

    await redis.del(`thread?id=${threadId}`);

    const result = await Thread.findByIdAndUpdate(
      threadId,
      {
        $push: {
          replies: {
            author: user._id,
            content,
            likes: [], // ✅ FIXED: should be an empty array of ObjectIds
          },
        },
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).send({ message: "Thread not found" });
    }

    res.status(201).send(result);
  } catch (err) {
    console.error("Reply error:", err); // This will give a better trace
    res.status(500).send({ message: "Something went wrong" });
  }
});
// router.post("/v1/thread/reply", async (req, res) => {
//   try {
//     const user = req.user;
//     const { threadId, content } = req.body;

//     await redis.del(`thread?id=${threadId}`);

//     const result = await Thread.findByIdAndUpdate(
//       threadId,
//       {
//         $push: {
//           replies: {
//             author: user._id,
//             content: content,
//             likes: 0,
//           },
//         },
//       },
//       { new: true }
//     );

//     res.status(201).send(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ message: "Something went wrong" });
//   }
// });

// like a thread

router.post("/v1/thread/like", async (req, res) => {
  try {
    const user = req.user;
    const { threadId, like = true } = req.body;

    await redis.del(`thread?id=${threadId}`);

    if (threadId === undefined) {
      res.status(400).send({ message: "Invalid threadId" });
    }

    const response = await Thread.findByIdAndUpdate(
      threadId,
      like
        ? {
            $addToSet: {
              likes: user._id,
            },
          }
        : {
            $pull: {
              likes: user._id,
            },
          }
    );

    const oldRecordStatus = response.likes.indexOf(user._id) !== -1;

    // update author's likes received count
    if (like === true && !oldRecordStatus) {
      await User.findByIdAndUpdate(response.author, {
        $inc: { likesReceived: 1 },
      });
    } else if (like === false && oldRecordStatus) {
      await User.findByIdAndUpdate(response.author, {
        $inc: { likesReceived: -1 },
      });
    }

    res
      .status(201)
      .send(like ? "Liked successfully" : "Removed like successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Something went wrong" });
  }
});

// Top contributors api
router.get("/v1/users/top", async (req, res) => {
  try {
    // fetch cached data from redis if available
    const cachedData = await redis.get("topContributors");

    // check for cached data
    if (cachedData) {
      const data = JSON.parse(cachedData);
      res.status(200).send(data);
    } else {
      const data = await User.find({}, "_id username likesReceived").sort({
        likesReceived: -1,
      });

      // cache the result in redis
      await redis.setex("topContributors", 600, JSON.stringify(data));
      res.status(200).send(data);
    }
  } catch (err) {
    res.status(500).send({ message: "Something went wrong" });
    console.log("top contributors", err);
  }
});

router.delete("/v1/thread/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id; // Assuming user is authenticated and stored in `req.user`

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Find the thread by ID
    const thread = await Thread.findById(id);
    console.log("thread :", thread);
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    // Check if the user is the author of the thread
    if (thread.author.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own threads" });
    }

    await User.findByIdAndUpdate(thread.author, {
      $inc: { likesReceived: -thread?.likes?.length },
    });
    // Delete the thread
    await Thread.findByIdAndDelete(id);
    return res.status(200).json({ message: "Thread deleted successfully" });
  } catch (error) {
    console.error("Error deleting thread:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.patch("/v1/thread/:threadId", async (req, res) => {
  try {
    const { threadId } = req.params;
    const { content } = req.body;
    console.log("content :", content);
    const user = req.user;
    console.log("user :", user);

    if (!threadId || !content) {
      return res
        .status(400)
        .json({ message: "Thread ID and content are required." });
    }
    await redis.del(`thread?id=${threadId}`);

    const thread = await Thread.findOneAndUpdate(
      { _id: threadId, author: user._id },
      { $set: { content } },
      { new: true, runValidators: true }
    );

    console.log("thread :", thread);
    if (!thread) {
      return res
        .status(404)
        .json({ message: "Thread not found or unauthorized" });
    }

    res.status(200).json({ message: "Thread updated successfully", thread });
  } catch (err) {
    console.error("Error updating thread:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/v1/thread-replay/like", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const user = req.user;
    const { threadId, replyId, like = true } = req.body;

    if (!threadId || !replyId) {
      return res.status(400).send({ message: "Missing threadId or replyId" });
    }

    if (!mongoose.Types.ObjectId.isValid(replyId)) {
      return res.status(400).send({ message: "Invalid replyId" });
    }

    try {
      await redis.del(`thread?id=${threadId}`);
    } catch (err) {
      console.warn("Redis cache clear failed:", err.message);
    }

    const thread = await Thread.findById(threadId);
    if (!thread) {
      return res.status(404).send({ message: "Thread not found" });
    }

    const reply = thread.replies.id(replyId);
    if (!reply) {
      return res.status(404).send({ message: "Reply not found" });
    }

    const userIdStr = user._id.toString();
    if (!Array.isArray(reply.likes)) {
      reply.likes = [];
    }
    if (like) {
      if (!reply.likes.some(id => id.toString() === userIdStr)) {
        reply.likes.push(user._id);
      }
    } else {
      reply.likes = reply.likes.filter(id => id.toString() !== userIdStr);
    }

    await thread.save();

    res.status(201).send({
      message: like ? "Liked successfully" : "Removed like successfully",
      likesCount: reply.likes.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.patch("/v1/thread/:threadId/verify/:replyId", is_author, async (req, res) => {
  try {
    const { replyId } = req.params;
    console.log('req :', req);
    req.thread.replies = req.thread.replies.map((reply) => {
      if (reply._id.toString() === replyId) {
        reply.is_answer = !reply.is_answer;
      }
      else {
        reply.is_answer = false;
      }
      return reply;
    })
    await req.thread.save();

    return res.status(200).send({message: "success"});
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Something went wrong" });
  }
})

module.exports = router;
