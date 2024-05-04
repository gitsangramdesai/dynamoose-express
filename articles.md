Today we explore dynamoose a ODM or dynamodb.I am using local dynamodb
instead of cloud instance.

As usual I am creating by base express template using generator.

express --view=ejs dynamoose-express

Now i will create a demo.js in route & mount it in app.js at mountpoint 'demo'

Content of demo.js

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

Changes required in app.js

var demoRouter = require('./routes/demo');
      & 
app.use('/demo', demoRouter);

Now lets install required npm packages

Please check the packages to install from package.json below

{
  "name": "dynamoose-express",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "start": "node ./bin/www"
  },
  "dependencies": {
    "cookie-parser": "~1.4.4",
    "debug": "~2.6.9",
    "dotenv": "^16.4.5",
    "dynamoose": "^4.0.1",
    "ejs": "~2.6.1",
    "express": "^4.19.2",
    "http-errors": "~1.6.3",
    "morgan": "~1.9.1",
    "uuid": "^9.0.1"
  }
}

Now add connection.js at root

const dynamoose = require('dynamoose');

dynamoose.aws.ddb.local("http://localhost:8000")
module.exports = dynamoose


create a models folder and add userModel.js into it as

const dynamoose = require("../connection");
const { v4: uuidv4 } = require('uuid');
const UserSchema = new dynamoose.Schema(
  {
    userId: {
      type: String,
      hashKey: true,
      default:uuidv4()
    },
    email: {
      type: String,
      index: {
        name: "EmailIndex",
        global: true,
        rangeKey: "userId",
      },
    },
    name: {
      type: String,
    },
    age: Number,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    throughput: "ON_DEMAND", // or { read: 5, write: 5 }
  }
);

const User = dynamoose.model("User", UserSchema);
module.exports = User;

My .env file is as below

AWS_ACCESS_KEY_ID = "fakeMyKeyId"
AWS_SECRET_ACCESS_KEY = "fakeSecretAccessKey"
AWS_REGION = "fakeRegion"

You can run npm install meanwhile if npm packages not yet installed.

Now to check & rest endpoint created run npm start.

Endpoint:

For creation of User:

curl --location 'http://localhost:3000/demo/createUser' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name":"Vijay Desai",
    "email":"Vijay@gmail.com",
    "age":24
}'

Output:
{
    "success": true,
    "message": "User created Successully",
    "data": {
        "name": "Vijay Desai",
        "email": "Vijay@gmail.com",
        "age": 24,
        "userId": "fda3f7e2-c835-45ff-853c-b93f8b26cb93",
        "createdAt": "2024-05-04T13:28:45.554Z"
    }
}

For Updation of Existing User.

curl --location --request PUT 'http://localhost:3000/demo/2' \
--header 'Content-Type: application/json' \
--data-raw '{
   "name": "Sangram Desai",
   "email": "sangram@gmail.com",
   "age": 43
}'

Output:
{
    "success": true,
    "message": "User saved successfully",
    "data": {
        "name": "Sangram Desai",
        "email": "sangram@gmail.com",
        "age": 43,
        "userId": "2",
        "updatedAt": "2024-05-04T13:31:30.480Z",
        "createdAt": "2024-05-04T13:31:30.483Z"
    }
}

For viewing list o all users:
curl --location 'http://localhost:3000/demo/getAll'

For getting user by its userId:

curl --location 'http://localhost:3000/demo/getByUserId/fda3f7e2-c835-45ff-853c-b93f8b26cb93'

There are some other endpoint that you can explore.

The complete code of this project is available at 
https://github.com/gitsangramdesai/dynamoose-express.