const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));
app.use(cookieParser());

const JWT_SECRET = "badass";

const User = require('./models/User');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage });

mongoose.connect('mongodb://cobra-kai-mongo:27017/jikan', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB', err));

function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    console.log(token);
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        if (user.account !== 'sensei') return res.sendStatus(403).json({ message: 'User is not a sensei.' });
        next();
    });
}

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/dashboard', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).redirect('/');
    }
    try {
        jwt.verify(token, JWT_SECRET);
        res.render('dashboard');
    } catch (err) {
        return res.status(401).redirect('/');
    }
});

const schedule = [
    { day: 'Monday', time: '6:00 PM', class: 'Beginner' },
    { day: 'Tuesday', time: '7:00 PM', class: 'Intermediate' },
    { day: 'Wednesday', time: '8:00 PM', class: 'Advanced' },
    { day: 'Thursday', time: '6:00 PM', class: 'Beginner' },
    { day: 'Friday', time: '7:00 PM', class: 'Sparring' },
    { day: 'Saturday', time: '10:00 AM', class: 'All Levels' },
    { day: 'Sunday', time: 'Closed', class: 'Closed' },
];

app.get('/api/schedule', (req, res) => {
    res.json(schedule);
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, password, account } = req.body;
        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(400).json({ error: 'Username already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, account });
        await user.save();

        res.status(201).json({ message: 'Registration successful.' });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        return res.status(400).json({ error: 'Invalid username or password.' });
    }
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        return res.status(400).json({ error: 'Invalid username or password.' });
    }
    const token = jwt.sign({ username: user.username, account: user.account }, JWT_SECRET, { expiresIn: '24h' });

    res.cookie('token', token, { httpOnly: true });
    res.json({ token });
});

app.get('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

app.post('/api/admin/upload', authenticateToken, (req, res) => {
    upload.array('photos', 12)(req, res, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.redirect('/dashboard');
    });
});

app.get('/api/admin/files', (req, res) => {
    fs.readdir('./public/uploads/', (err, files) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(files);
    });
});

app.post('/api/admin/update', authenticateToken, (req, res) => {
    const filePath = req.body.filePath;
    try {
        require(`./${filePath}`);
        res.json({ message: 'Script executed.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/clear-db', async (req, res) => {
    try {
        await User.deleteMany({});
        res.json({ message: 'Database cleared.' });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong.' });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});