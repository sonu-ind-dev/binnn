
export const checkAuth = (req, res, next) => {
    req.user_id = "36cedefc-4c96-4902-840a-6bceda72fc47";
    next();
    return;
}