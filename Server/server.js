const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./db');
const User = require('./models/userModel');
const Favorite = require('./models/favoriteModel');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// התחברות ל־MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use(express.static(path.join(__dirname, '..', '/Client')));

// בדיקת תקינות
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'Server is running and connected to MongoDB!' });
});

// הרשמה
app.post('/api/signup', async (req, res) => {
  const { firstName, lastName, username, password } = req.body;

  if (!firstName || !lastName || !username || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    const newUser = new User({ firstName, lastName, username, password });
    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: newUser._id,
        username: newUser.username
      }
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// התחברות
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    res.status(200).json({
      message: 'Login successful!',
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});








// שליפת פרטי משתמש
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// שמירת מתכון למועדפים
app.post('/api/favorites', async (req, res) => {
  const { userId, recipeId, title, image, sourceUrl, ingredients } = req.body;

  if (!userId || !recipeId || !title) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const existing = await Favorite.findOne({ userId, recipeId });
    if (existing) {
      return res.status(409).json({ message: 'Recipe already saved.' });
    }

    const newFavorite = new Favorite({
      userId,
      recipeId,
      title,
      image,
      sourceUrl,
      ingredients
    });

    await newFavorite.save();
    res.status(201).json({ message: 'Recipe saved successfully!', favorite: newFavorite });
  } catch (err) {
    console.error('Save favorite error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// שליפת מועדפים לפי משתמש
app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.params.userId });
    res.status(200).json(favorites);
  } catch (err) {
    console.error('Get favorites error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// חיפוש מתכונים לפי מרכיבים
app.get('/api/fridge', async (req, res) => {
  const { ingredients } = req.query;

  if (!ingredients) {
    return res.status(400).json({ message: 'Ingredients are required.' });
  }

  try {
    const apiKey = process.env.SPOONACULAR_API_KEY;
    const apiUrl = `https://api.spoonacular.com/recipes/findByIngredients`;

    const response = await axios.get(apiUrl, {
      params: {
        ingredients,
        number: 8,
        apiKey
      }
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error('Spoonacular API error:', err.message);
    res.status(500).json({ message: 'Failed to fetch recipes' });
  }
});

// המלצות לפי מועדפים



// המלצות לפי מועדפים
app.get("/api/recommendations/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const favorites = await Favorite.find({ userId });
    const ingredients = favorites.flatMap(f => f.ingredients);

    if (!ingredients.length) {
      return res.status(200).json([]); // אין מרכיבים => אין המלצות
    }

    const apiKey = process.env.SPOONACULAR_API_KEY;

    const response = await axios.get(`https://api.spoonacular.com/recipes/findByIngredients`, {
      params: {
        ingredients: ingredients.join(','),
        number: 6,
        apiKey
      }
    });

    res.status(200).json(response.data);

  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.message || err.message;

    console.error("Recommendation API error:", status, message);

    if (status === 401 || status === 402) {
      return res.status(status).json({
        message: "Spoonacular API error: " + message
      });
    }

    res.status(500).json({ message: "Failed to fetch recommendations." });
  }
});




// מחיקת מתכון ממועדפים
app.delete('/api/favorites/:recipeId', async (req, res) => {
  const { recipeId } = req.params;
  const { userId } = req.body;

  if (!userId || !recipeId) {
    return res.status(400).json({ message: "Missing userId or recipeId" });
  }

  try {
    const deleted = await Favorite.findOneAndDelete({ userId, recipeId });
    if (!deleted) {
      return res.status(404).json({ message: "Favorite not found." });
    }

    res.status(200).json({ message: "Recipe removed from favorites.", deleted });
  } catch (err) {
    console.error("Delete favorite error:", err.message);
    res.status(500).json({ message: "Server error during delete." });
  }
});


app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({}, 'firstName lastName username createdAt subscriptionStatus');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});







// עדכון סטטוס מנוי משתמש
// accepts 'active' or 'inactive' status
app.put('/api/users/:id/subscription', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.subscriptionStatus = status;
    await user.save();

    res.status(200).json({
      message: `Subscription updated to ${status}`,
      subscriptionStatus: user.subscriptionStatus
    });
  } catch (err) {
    console.error("Update subscription error:", err.message);
    res.status(500).json({ message: "Server error during subscription update" });
  }
});



// הרצת השרת
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});




// סטטיסטיקות - מספר משתמשים שנרשמו לפי חודש
//צד שמאל Last visit

app.get('/api/stats/registrations-per-month', async (req, res) => {
  try {
    const users = await User.find();
    const monthlyCounts = Array(12).fill(0);

    users.forEach(user => {
      const month = new Date(user.createdAt).getMonth(); // 0 = Jan, 1 = Feb, ...
      monthlyCounts[month]++;
    });

    res.json(monthlyCounts);
  } catch (err) {
    console.error("Error fetching registration stats:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});



