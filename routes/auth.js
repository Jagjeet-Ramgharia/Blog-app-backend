const router = require("express").Router();
const User = require("../models/Users");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const {
  userValidationResult,
  userValidator,
  resetPasswordValidation,
  loginValidation,
} = require("../validators/uservalidator");

//Register a user
router.post(
  "/register",
  userValidator,
  userValidationResult,
  async (req, res) => {
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
      const smtpTransporter = nodemailer.createTransport({
        service: "Gmail",
        port: 465,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });
      const msg = {
        from: process.env.GMAIL_USER,
        to: newUser.email,
        subject: "Successful Sign Up",
        html: `<h1>Welcome to Bloster App</h>
             <h3>Username : ${newUser.username},</h3>
             <h3>Email : ${newUser.email}</h3> 
             <hr/>
             <p>By signing up, you agree to our Terms , Data Policy and Cookies Policy .</p>`,
      };

      smtpTransporter.sendMail(msg, (err, response) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Email sent");
        }
      });
      smtpTransporter.close();
      // sgMail.setApiKey(process.env.SENDGRID_KEY);
      // const msg = {
      //   to: savedUser.email,
      //   from: "ramghariajagjeet4281@gmail.com",
      //   subject: "Successfull Sign Up",
      //   text: "Welcome to the Blogster.com",
      // };
      // sgMail
      //   .send(msg)
      //   .then(() => {
      //     console.log("Email sent");
      //   })
      //   .catch((error) => {
      //     console.error(error);
      //   });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

//Login

router.post(
  "/login",
  loginValidation,
  userValidationResult,
  async (req, res) => {
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
  }
);

//reset password
router.post(
  "/reset-password",
  resetPasswordValidation,
  userValidationResult,
  async (req, res) => {
    let token;
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        console.log(err);
      }
      token = buffer.toString("hex");
      User.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
          res
            .status(422)
            .json({ error: "User does not exist with the given email" });
        }
        user.resetToken = token;
        user.expireToken = Date.now() + 3600000;
        user.save().then((result) => {
          const smtpTransporter = nodemailer.createTransport({
            service: "Gmail",
            port: 465,
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_PASS,
            },
          });
          const msg = {
            to: result.email,
            from: process.env.GMAIL_USER,
            subject: "Reset Password",
            text: "Follow the given link to reset your password",
            html: `<p>Your request for reset password</p>
                  <h3>Click this <a href="http://localhost:3000/reset-password/${token}">link</a> to reset password</h3></br>
                  <hr/>
                  <p>Blogster</p>`,
          };

          smtpTransporter.sendMail(msg, (err, response) => {
            if (err) {
              console.log("nodemailer Error " + err);
            } else {
              console.log("Email has been Sent");
            }
          });
        });
      });
    });

    res.status(200).json({ message: "Email has been sent" });
  }
);

//new password

router.post("/new-password", async (req, res) => {
  try {
    const newPassword = req.body.password;
    const token = req.body.token;
    const user = await User.findOne({
      resetToken: token,
      expireToken: { $gt: Date.now() },
    });
    !user && res.status(400).json({ error: "Try again, Session expired" });
    const salt = await bcrypt.genSalt(10);
    const _new_hashed_password = await bcrypt.hash(newPassword, salt);
    user.password = _new_hashed_password;
    user.resetToken = undefined;
    user.expireToken = undefined;
    const result = await user.save();
    res.status(200).json({ message: "Password has been Updated" });
    const smtpTransporter = nodemailer.createTransport({
      service: "Gmail",
      port: 465,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
    const msg = {
      from: process.env.GMAIL_USER,
      to: newUser.email,
      subject: "Successful Password Update",
      html: `<h2>Password has been Successfully Updated</h2>
           <h3>Username : ${newUser.username},</h3>
           <h3>Email : ${newUser.email}</h3>`,
    };

    smtpTransporter.sendMail(msg, (err, response) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent");
      }
    });
    smtpTransporter.close();
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
