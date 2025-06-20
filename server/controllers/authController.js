const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
    console.log('Registration request received:', req.body);
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 6) {
        console.log('Password too short');
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user (password will be hashed by the pre-save hook)
        const newUser = new User({ email, password, creditBalance: 0 });
        await newUser.save();
        
        // Generate JWT token for automatic login
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        console.log('User registered successfully:', email);
        res.status(201).json({ 
            message: 'User registered successfully',
            token,
            user: { 
                id: newUser._id, 
                email: newUser.email, 
                creditBalance: newUser.creditBalance 
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

// Login a user
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log('User found:', email);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log('Login successful for user:', email);
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, email: user.email, creditBalance: user.creditBalance } });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

// Get current user profile
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            id: user._id,
            email: user.email,
            creditBalance: user.creditBalance
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile', error });
    }
};