const router = require("express").Router();
const User = require("../models/Users");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

//Register a user
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const SecuredPwd = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: SecuredPwd,
      about: req.body.about,
    });
    const savedUser = await newUser.save();
    try {
      transporter.sendMail(
        {
          to: savedUser.email,
          from: "no-reply@blogster.com",
          subject: "Successfull Sign-in",
          html: "<h1>Welcome to Blogster.com</h1>",
        },
        (err) => {
          console.log("nodemailer error " + err);
        }
      );
    } catch (err) {
      console.log(err.message);
    }
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Login

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(400).json("Invalid Username and Password");
    const validate = await bcrypt.compare(req.body.password, user.password);
    !validate && res.status(400).json("Invalid Username and Password");
    const { password, ...data } = user._doc;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
