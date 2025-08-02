// In a separate controller file (userController.js)
exports.updateUser = async (req, res) => {
  // ... same implementation as above
};

// In routes file
const userController = require('./controllers/userController');
router.put('/users/:id', userController.updateUser);