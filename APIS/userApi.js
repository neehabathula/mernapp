//create router to handle user api reqs
const exp = require("express");
const userApp = exp.Router();
const expressAsyncHandler = require("express-async-handler");
//import bcryptjs for password hashing
const bcryptjs = require("bcryptjs");
//import jsonwebtoken to create token
const jwt=require("jsonwebtoken")
//to extract body of request object
userApp.use(exp.json());
//env object
require("dotenv").config()
//DB connection URL
const DBurl=process.env.DATABASE_URL;
//USER API Routes

//create route to handle '/getusers' path
userApp.get(
  "/getusers",
  expressAsyncHandler(async (request, response) => {
    //get userCollectionObject
    let userCollectionObject = request.app.get("userCollectionObject");
    //get all users
    let users = await userCollectionObject.find().toArray();
    //send res
    response.send({ message: "Users list", payload: users });
  })
);

//create route to user login
userApp.post(
  "/login",
  expressAsyncHandler(async (request, response) => {
    //get userCollectionObject
    let userCollectionObject = request.app.get("userCollectionObject");
    //get user credentials obj from client
    let userCredObj=request.body
    //seacrh for user by username
    let userOfDB=await userCollectionObject.findOne({username:userCredObj.username});
    //if username not existed
    if(userOfDB==null){
      response.send({message:"Invalid user"})
    }
    //if username existed
    else{
      //compare passwords
      let status=await bcryptjs.compare(userCredObj.password,userOfDB.password);
      //if passwords not matched
      if(status==false){
        response.send({message:"Invalid password"})
      }
      //if passwords are matched
      else{
        //create token
        const secretKey=process.env.SECRET_KEY
        let token=jwt.sign({username:userOfDB.username},secretKey,{expiresIn:60})
        //send token
        response.send({message:"login success",payload:token,userObj:userOfDB})
      }
    }
  })
);

//create a route to 'create-user'
userApp.post(
  "/create-user",
  expressAsyncHandler(async (request, response) => {
    //get userCollectionObject
    let userCollectionObject = request.app.get("userCollectionObject");
    //get userObj from client
    let newUserObj = request.body;
    //seacrh for user by username
    let userOfDB = await userCollectionObject.findOne({
      username: newUserObj.username,
    });
    //if user existed
    if (userOfDB !== null) {
      response.send({
        message: "Username has already taken..Plz choose another",
      });
    }
    //if user not existed
    else {
      //hash password
      let hashedPassword = await bcryptjs.hash(newUserObj.password, 6);
      //replace plain password with hashed password in newUserObj
      newUserObj.password = hashedPassword;
      //insert newUser
      await userCollectionObject.insertOne(newUserObj);
      //send response
      response.send({ message: "New User created" });
    }
  })
);

//create a route to modify user data


//create a route to delete user by username


//export userApp
module.exports = userApp;