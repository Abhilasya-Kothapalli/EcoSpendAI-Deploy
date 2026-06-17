const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Generate JWT Helper
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'ecospend_jwt_secret_token_key_9988', {
    expiresIn: '7d',
  });

  // Set as HttpOnly cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure in production
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      weeklyScore: 100, // Defaults to 100 for a fresh score tracker
      ecoPoints: 2, // 2 points for first login/visit
      loginStreak: 1,
      lastLoginDate: new Date()
    });

    const token = generateToken(res, user._id);

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      totalSavings: user.totalSavings,
      totalCarbonOffset: user.totalCarbonOffset,
      ecoPoints: user.ecoPoints,
      weeklyScore: user.weeklyScore,
      loginStreak: user.loginStreak,
      acceptedChallenges: user.acceptedChallenges || [],
      token
    });
  } catch (error) {
    console.error('Register Error:', error.message);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Streak and daily check-in points updates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!user.lastLoginDate) {
      user.loginStreak = 1;
      user.ecoPoints += 2;
    } else {
      const lastLogin = new Date(user.lastLoginDate);
      lastLogin.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(today - lastLogin);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        user.loginStreak += 1;
        user.ecoPoints += 2;
      } else if (diffDays > 1) {
        user.loginStreak = 1;
        user.ecoPoints += 2;
      }
    }
    user.lastLoginDate = today;
    await user.save();

    const token = generateToken(res, user._id);

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      totalSavings: user.totalSavings,
      totalCarbonOffset: user.totalCarbonOffset,
      ecoPoints: user.ecoPoints,
      weeklyScore: user.weeklyScore,
      loginStreak: user.loginStreak,
      profilePhoto: user.profilePhoto,
      acceptedChallenges: user.acceptedChallenges || [],
      token
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/users/logout
// @access  Private
const logoutUser = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  return res.json({ message: 'Logged out successfully' });
};

// @desc    Get user profile details
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// @desc    Get leaderboard rankings
// @route   GET /api/users/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    // Return users sorted by weeklyScore descending, including current user
    const users = await User.find({}).select('name totalCarbonOffset ecoPoints weeklyScore profilePhoto').sort({ weeklyScore: -1 });
    return res.json(users);
  } catch (error) {
    console.error('Get Leaderboard Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
};

// @desc    Update user points (e.g. check-in or shopping)
// @route   PUT /api/users/points
// @access  Private
const updateUserPoints = async (req, res) => {
  const { pointsChange, savingsChange, offsetChange, scoreChange } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (pointsChange) user.ecoPoints = Math.max(0, user.ecoPoints + pointsChange);
    if (savingsChange) user.totalSavings = Math.max(0, user.totalSavings + savingsChange);
    if (offsetChange) user.totalCarbonOffset = Math.max(0, user.totalCarbonOffset + offsetChange);
    if (scoreChange) user.weeklyScore = Math.max(1, Math.min(100, user.weeklyScore + scoreChange));

    await user.save();
    return res.json({
      _id: user._id,
      name: user.name,
      totalSavings: user.totalSavings,
      totalCarbonOffset: user.totalCarbonOffset,
      ecoPoints: user.ecoPoints,
      weeklyScore: user.weeklyScore,
    });
  } catch (error) {
    console.error('Update Points Error:', error.message);
    return res.status(500).json({ message: 'Server error updating points' });
  }
};

const googleLogin = async (req, res) => {
  const { email, name } = req.body;
  try {
    if (!email || !name) {
      return res.status(400).json({ message: 'Missing Google user data' });
    }

    let user = await User.findOne({ email });
    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('google_oauth_fallback_pwd_' + Math.random(), salt);
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        weeklyScore: 100,
        ecoPoints: 10, // starting gift points
        loginStreak: 1,
        lastLoginDate: new Date()
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!isNewUser) {
      if (!user.lastLoginDate) {
        user.loginStreak = 1;
        user.ecoPoints += 2;
      } else {
        const lastLogin = new Date(user.lastLoginDate);
        lastLogin.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(today - lastLogin);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          user.loginStreak += 1;
          user.ecoPoints += 2;
        } else if (diffDays > 1) {
          user.loginStreak = 1;
          user.ecoPoints += 2;
        }
      }
      user.lastLoginDate = today;
      await user.save();
    }

    const token = generateToken(res, user._id);

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      totalSavings: user.totalSavings,
      totalCarbonOffset: user.totalCarbonOffset,
      ecoPoints: user.ecoPoints,
      weeklyScore: user.weeklyScore,
      loginStreak: user.loginStreak,
      profilePhoto: user.profilePhoto,
      acceptedChallenges: user.acceptedChallenges || [],
      token
    });
  } catch (error) {
    console.error('Google Login Error:', error.message);
    return res.status(500).json({ message: 'Server error during Google Authentication' });
  }
};

const updateProfilePhoto = async (req, res) => {
  const { profilePhoto } = req.body;
  try {
    if (!profilePhoto) {
      return res.status(400).json({ message: 'Please provide base64 image data' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.profilePhoto = profilePhoto;
    await user.save();

    return res.json({
      message: 'Profile photo updated successfully',
      profilePhoto: user.profilePhoto
    });
  } catch (error) {
    console.error('Profile photo update failed:', error.message);
    return res.status(500).json({ message: 'Server error updating profile photo' });
  }
};

const acceptChallenge = async (req, res) => {
  const { challengeName, pointsReward } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.acceptedChallenges) {
      user.acceptedChallenges = [];
    }

    if (user.acceptedChallenges.includes(challengeName)) {
      return res.status(400).json({ message: 'Challenge already accepted' });
    }

    user.acceptedChallenges.push(challengeName);
    if (pointsReward) {
      user.ecoPoints += pointsReward;
    }

    await user.save();
    return res.json({
      message: 'Challenge accepted successfully',
      acceptedChallenges: user.acceptedChallenges,
      ecoPoints: user.ecoPoints
    });
  } catch (error) {
    console.error('Accept Challenge Error:', error.message);
    return res.status(500).json({ message: 'Server error accepting challenge' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  getLeaderboard,
  updateUserPoints,
  googleLogin,
  updateProfilePhoto,
  acceptChallenge
};
