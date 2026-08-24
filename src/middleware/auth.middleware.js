
export const checkAuth = (req, res, next) => {
    req.user_id = "sonu";
    next();
}