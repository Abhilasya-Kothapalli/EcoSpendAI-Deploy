const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  getLeaderboard,
  updateUserPoints,
  googleLogin,
  updateProfilePhoto,
  acceptChallenge
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/google-login', googleLogin);
router.get('/profile', protect, getUserProfile);
router.get('/leaderboard', protect, getLeaderboard);
router.put('/points', protect, updateUserPoints);
router.put('/profile-photo', protect, updateProfilePhoto);
router.put('/accept-challenge', protect, acceptChallenge);

module.exports = router;
