const { check, validationResult } = require("express-validator");
const Users = require("../models/Users");
const bcrypt = require("bcrypt");

exports.userValidationResult = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = error.array()[0].msg;
    return res.status(422).json({ success: false, error: err });
  }
  next();
};

exports.userValidator = [
  check("username")
    .custom(async (username) => {
      return Users.findOne({ username }).then((user) => {
        if (user) {
          return Promise.reject("Please provide a unique username");
        }
      });
    })
    .trim()
    .not()
    .isEmpty()
    .withMessage("Username must be provided")
    .isLength({ min: 3 })
    .withMessage("Username must be 3 character Long"),
  check("email")
    .custom(async (email) => {
      return Users.findOne({ email: email }).then((user) => {
        if (user) {
          return Promise.reject("E-mail already in use");
        }
      });
    })
    .trim()
    .not()
    .isEmpty()
    .withMessage("Email must be provided")
    .isEmail()
    .withMessage("Please Provide a valid email"),
  check("about")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Tell something about you."),
  check("password")
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must contain atleast 6 characters"),
];

exports.loginValidation = [
  check("username")
    .not()
    .isEmpty()
    .withMessage("Username is required")
    .custom(async (username) => {
      return Users.findOne({ username }).then((user) => {
        if (!user) {
          return Promise.reject("Provide a Valid Username");
        }
      });
    }),
  check("password").not().isEmpty().withMessage("Password is required"),
];

exports.resetPasswordValidation = [
  check("email")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Email must be provided")
    .isEmail()
    .withMessage("Please Provide a valid email")
    .custom(async (email) => {
      return Users.findOne({ email: email }).then((user) => {
        if (!user) {
          return Promise.reject("User does not exist with the given email");
        }
      });
    }),
];

exports.newPasswordValidation = [
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password must be provided.")
    .isLength({ min: 6 })
    .withMessage("Password must contain atleast 6 characters")
    .custom(async (password) => {
      const user = await Users.findOne(req.params.token);
      const newPassword = await bcrypt
        .compare(password, user.password)
        .then((pwd) => {
          if (pwd === user.password) {
            return Promise.reject("New Password can not be the old Password");
          }
        });
    }),
];
