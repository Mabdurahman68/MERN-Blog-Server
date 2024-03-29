const { request } = require("express")
const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")

const requiredLogin = require("../middleware/requiredLogin")
const Post = mongoose.model("Post")
const User = mongoose.model("User")


router.get("/user/:id", requiredLogin, (req, res) => {
  User.findOne({ _id: req.params.id })
    .select("-password")
    .then((user) => {
      Post.find({ postedBy: req.params.id })
        .populate("postedBy", "_id name pic")
        .populate("comments.postedBy", "_id name")
        .exec((err, posts) => {
          if (err) {
            return res.status(422).json({ error: err })
          }
          res.json({ user, posts })
        })
    })
    .catch((err) => {
      return res.status(422).json({ error: "user not found" })
    })
})

router.put("/follow", requiredLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.body.followId,
    {
      $push: { followers: req.user._id }, //id of the logged in user
    },
    { new: true },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err })
      }
      User.findByIdAndUpdate(
        req.user._id,
        {
          $push: { following: req.body.followId },
        },
        { new: true },
      )
        .select("-password")
        .then((result) => {
          res.json(result)
        })
        .catch((err) => {
          return res.status(422).json({ error: err })
        })
    },
  )
})

router.put("/unfollow", requiredLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.body.unfollowId,
    {
      $pull: { followers: req.user._id }, //id of the logged in user
    },
    { new: true },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err })
      }
      User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { following: req.body.unfollowId },
        },
        { new: true },
      )
        .select("-password")
        .then((result) => {
          res.json(result)
        })
        .catch((err) => {
          return res.status(422).json({ error: err })
        })
    },
  )
})

router.put("/updatepic", requiredLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    { $set: { pic: req.body.pic } },
    { new: true },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err })
      }
      res.json(result)
    },
  )
})

module.exports = router
