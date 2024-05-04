var express = require("express");
var router = express.Router();
var User = require("../models/userModel");

/* GET home page. */
router.post("/createUser", async function (req, res, next) {
  try {
    // Use the model
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      age: req.body.age,
    });

    // Save the user to DynamoDB
    let savedUser = await user.save({ overwrite: false });
    savedUser.createdAt = new Date(savedUser.createdAt)

    res.json({
      success: true,
      message: "User created Successully",
      data: savedUser,
    });
  } catch (exp) {
    res.json({ success: false, message: exp.message });
  }
});

//get record by email
router.get("/getByEmail/:email", async function (req, res, next) {
  try {
    let user = await User.query("email").eq(req.params.email).exec();
    res.json({ success: true, message: "User found", data: user });
  } catch (exp) {
    res.json({ success: false, message: exp.message });
  }
});

//get record by user id
router.get("/getByUserId/:userId", async function (req, res, next) {
  try {
    let user = await User.query("userId").eq(req.params.userId).exec();
    res.json({ success: true, message: "User found", data: user });
  } catch (exp) {
    res.json({ success: false, message: exp.message });
  }
});

//get all records
router.get("/getAll", async function (req, res, next) {
  try {
    const users = await User.scan().exec();
    res.json({ success: true, message: "User found", data: users });
  } catch (exp) {
    res.json({ success: false, message: exp.message });
  }
});

//greater than
router.get("/youngerThan/:age", async function (req, res, next) {
  try {
    const users = await User.scan()
      .filter("age")
      .gt(parseInt(req.params.age))
      .exec();
    res.json({ success: true, message: "User found Successully", data: users });
  } catch (exp) {
    res.json({ success: false, message: exp.message });
  }
});

//delete
router.delete("/:userId", async (req, res, next) => {
  try {
    let myUser = await User.query("userId").eq(req.params.userId).exec();
    if (myUser.length) {
      await myUser[0].delete(); // Delete the user with the specified userId
      res.json({ success: true, message: "User deleted successfully" });
    } else {
      res.json({ success: false, message: "User not found" });
    }
  } catch (exp) {
    res.json({ success: false, message: exp.message });
  }
});

//update
router.put("/:userId", async (req, res, next) => {
  try {
    let myUser = new User({
      name: req.body.name,
      email: req.body.email,
      age: req.body.age,
      userId: req.params.userId,
      updatedAt: Date.now(),
    });

    myUser = await myUser.save({ overwrite: true });

    myUser.updatedAt = new Date(myUser.updatedAt)
    myUser.createdAt = new Date(myUser.createdAt)

    res.json({
      success: true,
      message: "User saved successfully",
      data: myUser,
    });
  } catch (exp) {
    res.json({ success: false, message: exp.message });
  }
});

module.exports = router;
