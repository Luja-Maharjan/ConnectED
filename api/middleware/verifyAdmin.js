import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

export const verifyAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return next(errorHandler(403, 'Access denied. Admin only.'));
        }
        next();
    } catch (error) {
        next(error);
    }
};

