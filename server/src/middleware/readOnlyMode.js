export const readOnlyMode = (req, res, next) => {
  if (process.env.READ_ONLY_MODE === 'true') {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return res.status(403).json({ 
        error: 'Demo mode - write operations disabled' 
      });
    }
  }
  next();
};
