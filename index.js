const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// User registration
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    fs.readFile('./data/profiles.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Could not read profiles' });
        const profiles = JSON.parse(data);
        profiles.push({ username, password: hashedPassword, posts: [] });
        fs.writeFile('./data/profiles.json', JSON.stringify(profiles), (err) => {
            if (err) return res.status(500).json({ error: 'Could not save profile' });
            res.status(201).json({ message: 'User registered successfully' });
        });
    });
});

// User login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    fs.readFile('./data/profiles.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Could not read profiles' });
        const profiles = JSON.parse(data);
        const user = profiles.find(profile => profile.username === username);
        if (!user) return res.status(400).json({ error: 'User not found' });

        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                req.session.username = username; // Save user session
                res.json({ message: 'You successfully logged in' });
            } else {
                res.status(400).json({ error: 'Invalid credentials' });
            }
        });
    });
});

// API to get posts
app.get('/api/posts', (req, res) => {
    fs.readFile('./data/posts.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Could not read posts' });
        res.json(JSON.parse(data));
    });
});

// API to add a post
app.post('/api/posts', (req, res) => {
    const newPost = req.body.content;
    fs.readFile('./data/posts.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Could not read posts' });
        const posts = JSON.parse(data);
        const postId = posts.length ? posts[posts.length - 1].id + 1 : 1; // Auto-increment ID
        posts.push({ id: postId, content: newPost });
        fs.writeFile('./data/posts.json', JSON.stringify(posts), (err) => {
            if (err) return res.status(500).json({ error: 'Could not save post' });
            res.status(201).json({ message: 'Post added successfully', id: postId });
        });
    });
});

// API to delete a post
app.delete('/api/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    fs.readFile('./data/posts.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Could not read posts' });
        const posts = JSON.parse(data);
        const filteredPosts = posts.filter(post => post.id !== postId);
        fs.writeFile('./data/posts.json', JSON.stringify(filteredPosts), (err) => {
            if (err) return res.status(500).json({ error: 'Could not delete post' });
            res.json({ message: 'Post deleted successfully' });
        });
    });
});

// New API to fetch data from provided URLs
app.get('/api/data', async (req, res) => {
    const urls = [
        'https://pokemondb.net/mechanics/hidden',
        'https://www.astronomy.com/science/a-scientific-guide-to-the-zodiac-symbols-signs-and-flaws/',
        'https://www.figma.com/color-wheel/',
        'https://www.icreatedaily.com/good-habits-list/',
        'https://blog.pavlok.com/big-list-of-bad-habits/',
        'https://pokemondb.net/evolution',
        'https://www.thomas.co/resources/type/hr-guides/what-are-big-5-personality-traits/'
    ];
    
    try {
        const responses = await Promise.all(urls.map(url => fetch(url)));
        const data = await Promise.all(responses.map(response => response.text()));
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from external APIs' });
    }
});

// Starting the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
