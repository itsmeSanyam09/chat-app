import User from "../models/user.model.js";

import bcrypt from "bcryptjs";

import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async(req,res) => {
  const{ fullName, email, password } = req.body;
  try {
    if(!fullName || !email || !password){
      res.status(400).json({message:"All fields are required"});
    }


    if(password.length<8){
      res.status(400).json({message:"Password must be at least 8 characters"});
    }
    const user = await User.findOne({email});

    if(user) return res.status(400).json({message:"email already exists"});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    const newUser = new User({
      fullName,
      email,
      password:hashedPassword
    });

    if(newUser){
      generateToken(newUser._id,res);
      await newUser.save();

      res.status(201).json({
        userId:newUser._id,
        fullName:newUser.fullName,
        email:newUser.email,
        profilePic:newUser.profilePic,
      });


    }
    else{
      res.status(400).json({message:"Invalid user data"});
    }

    
  } catch (error) {
    console.log("error in signup controller",error.message);
    res.status(500).json({message:"Internal server error"});
    
  }
};
export const login =async (req, res) => {
  const { email,password } = req.body;
    try {
      const user =await User.findOne({email});
      if(!user) return res.status(400).json({message:"Invalid Credentials"});
      const isPasswordCorrect = await bcrypt.compare(password,user.password);
      if(!isPasswordCorrect) return res.status(400).json({message:"Invalid Credentials"});

      generateToken(user._id,res);
      res.status(201).json({
        userId:user._id,
        fullName:user.name,
        email:user.email,
        profilePic:user.profilePic,
      });
      console.log("user logged in");
      
      
    } catch (error) {
      console.log("error in login controller",error.message);
      res.status(500).json({message:"Internal server error"});
      
    }
};
export const logout = (req, res) => {
    try {
      res.cookie("jwt","",{maxAge:0});
      res.status(200).json({message:"User logged out"});
      
    } catch (error) {
      console.log("error in logout",error.message);
      res,status(500).json({message:"Internal server error"});
      
    }
};
export const updateProfile= async(req,res) =>{
  try {
    const {profilePic} = req.body;
    const userId = req.user._id;

    if(!profilePic){
      res.status(400).json({message:"profilePic is required"});
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true});
    res.status(200).json(updatedUser);

    
  } catch (error) {
    console.log("error in update profile",error.message);
    res.status(500).json({message:"Internal server error"});
    
  }

}
export const checkAuth =(req,res) => {
  try {
    res.status(200).json(req.user);
    
    
  } catch (error) {
    console.log("error in check authcontroller",error.message);
    res.status(500).json({message:"Internal server error"});
    
  }
};