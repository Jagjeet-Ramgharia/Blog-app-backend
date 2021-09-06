const router = require("express").Router();
const User = require("../models/Users");
const bcrypt = require("bcrypt");
const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");

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
    res.status(201).json(savedUser);
    sgMail.setApiKey(
      "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"
    );
    const msg = {
      to: savedUser.email,
      from: "ramghariajagjeet4281@gmail.com",
      subject: "Successfull Sign Up",
      text: "Welcome to the Blogster.com",
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
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
