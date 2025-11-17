import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";

export const signup = async (req, res, next) =>{
    const {username, email, password, role} = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
        return next(errorHandler(400, 'Username, email, and password are required.'));
    }
    
    // Validate role if provided
    if (role && !['admin', 'student'].includes(role)) {
        return next(errorHandler(400, 'Invalid role. Must be admin or student.'));
    }
    
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({
        username, 
        email, 
        password: hashedPassword,
        role: role || 'student' // Default to student if not provided
    });
    try {
        const savedUser = await newUser.save();
        const { password: pass, ...rest } = savedUser._doc;
        res.status(201).json({
            success: true,
            message: "User created Successfully.",
            user: rest,
        })
        
    } catch (error) {
        next(error);
        
    }
}

export const signin = async (req, res, next) =>{
    const{email, password} = req.body;
    try {
        const validUser = await User.findOne({ email });
        if(!validUser) return next(errorHandler(404, 'User not found!'));
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if(!validPassword) return next(errorHandler(401, 'Wrong credentials!'))
            const token = jwt.sign({id: validUser._id}, process.env.JWT_SECRET)
            const {password: pass, ...rest} = validUser._doc;
        res
        .cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        })
        .status(200)
        .json({
            success: true,
            user: rest,
        })

    } catch (error) {
        next(error);
    }
};

export const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if(!user){
            return next(errorHandler(404, 'User not found!'));
        }
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};

export const signout = (req, res, next) => {
    res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    }).status(200).json({
        success: true,
        message: 'Signed out successfully.',
    });
};