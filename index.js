const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const userRouter = require("./routes/users");
const postRoute = require("./routes/posts");
const catRouter = require("./routes/categories");
const multer = require("multer");
const port = process.env.PORT || 8000;

//middlewares
dotenv.config();
app.use(express.json());

//db
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((e) => {
    console.log(e);
  });

//storage

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json("File has been uploaded");
});

//routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRouter);
app.use("/api/posts", postRoute);
app.use("/api/categories", catRouter);
//listener
app.listen(port, () => {
  console.log(`Backend is running at port ${port}`);
});
