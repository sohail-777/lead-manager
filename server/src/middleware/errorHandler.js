function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.code === 11000) {
    return res.status(409).json({
      message: 'A record with this email already exists',
      errors: { email: 'This email is already in use' },
    });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON body' });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}

module.exports = { notFound, errorHandler };
