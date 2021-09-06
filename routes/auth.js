const router = require("express").Router();
const User = require("../models/Users");
const bcrypt = require("bcrypt");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");

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
    sgMail.setApiKey(process.env.SENDGRID_KEY);
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

//reset password
router.post("/reset-password", async (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString("hex");
    const user = User.findOne({ email: req.body.email });
    !user && res.status(404).json("User dose not exist with the given email.");
    user.resetToken = token;
    user.expireToken = Date.now() + 3600000;
    const result = user.save();
    sgMail.setApiKey(process.env.SENDGRID_KEY);
    const msg = {
      to: result.email,
      from: "ramghariajagjeet4281@gmail.com",
      subject: "Reset Password",
      text: "Follow the given link to reset your password",
      html: `<p>Your request for reset password</p>
              <h3>Click this <a href="http://localhost:3000/reset/${token}">link</a> to reset password</h3>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
  });
  res.status(200).json({ message: "Email has been sent" });
});

module.exports = router;
