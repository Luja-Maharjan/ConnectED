import jwt from "jsonwebtoken";

// Optional token verification - doesn't fail if no token is provided
export const optionalVerifyToken = (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) {
        // No token provided - continue without setting req.user
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Invalid token - continue without setting req.user
            return next();
        }
        req.user = user;
        next();
    });
};

