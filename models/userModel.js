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
