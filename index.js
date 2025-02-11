const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./schema/authModal");
const bcrypt = require("bcrypt");
const authMiddleware = require("./middleware/authMiddleware");
const Notes = require("./schema/notesModal");

const app = express();
const port = 9000;

// Enable CORS for all origins
app.use(cors());

app.use(cors({ origin: "*" }));

// Parse JSON bodies
app.use(express.json());

// Basic route to test the server
app.get("/", (req, res) => {
  res.send("Notes API is running");
});

///user signup
app.post("/api/auth/signin", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    let user = await User.findOne({ username });
    if (user) {
      if (bcrypt.compareSync(password, user?.password)) {
        return res.status(200).json({
          message: "User login successfully",
          data: user,
          token: user.generateAuthToken(), // ✅ Call the instance method
        });
      } else {
        return res.status(400).json({
          message: "enter valid password",
        });
      }
    }

    user = new User({ username, password });
    await user.save(); // ✅ Wait for save to complete

    res.status(201).json({
      message: "User registered successfully",
      data: user,
      token: user.generateAuthToken(), // ✅ Call the instance method
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }); // ✅ Send an error response
  }
});
// --------------------------------
app.post("/api/note/postNote", authMiddleware, async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const { noteId } = req.query;
    req.body = { ...req.body, userId };
    const note = await Notes.findOneAndUpdate(
      { _id: noteId || new mongoose.Types.ObjectId() },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }); // ✅ Send an error response
  }
});

app.get("/api/note/getNote", authMiddleware, async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const data = await Notes.find({ userId });
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/api/note/deleteNote", authMiddleware, async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const data = await Notes.findOneAndDelete({ _id: req.query.noteId });
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

(async () => {
  mongoose.connect("mongodb://142.171.90.20:27017/Notes").then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log("mongoDB  connected");
    });
  });
})();
