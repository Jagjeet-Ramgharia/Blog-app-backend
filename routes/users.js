const router = require("express").Router();
const User = require("../models/Users");
const Post = require("../models/Post");
const bcrypt = require("bcrypt");
const verify = require("../verifyToken");

//Update user
router.put("/:id", verify, async (req, res) => {
  if (req.body.userId === req.params.id) {
    const authHeader = req.headers.token;
    console.log(authHeader);
    const token = authHeader.split(" ")[1].toString();
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    try {
      const updateUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json({
        user: updateUser,
        AccessToken: token,
      });
    } catch (err) {
      console.log(err);
    }
  } else {
    res.status(401).json("You can't update this account");
  }
});

//delete a user
router.delete("/:id", verify, async (req, res) => {
  if ((req.body.id = req.params.id)) {
    try {
      const user = await User.findById(req.params.id);
      try {
        await Post.deleteMany({ username: user.username });
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("User has been deleted");
      } catch (err) {
        res.status(500).json(err);
      }
    } catch (err) {}
  } else {
    res.status(401).json("You can't delete this account");
  }
});

//get a user

router.get("/:id", verify, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
