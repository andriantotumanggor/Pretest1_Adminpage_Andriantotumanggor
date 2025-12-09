const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'rahasia-admin',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layout/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Database connection
const db = require('./config/database');

// Routes
const routes = require('./routes');
app.use('/', routes);

// Middleware untuk cek login (sederhana)
const requireLogin = (req, res, next) => {
    // Untuk demo, kita anggap selalu login
    // Di production, gunakan proper authentication
    next();
};

// Route utama
app.get('/', requireLogin, (req, res) => {
    res.render('index', { title: 'Dashboard Admin' });
});

// Error handling
app.use((req, res) => {
    res.status(404).render('error', { message: 'Halaman tidak ditemukan', activePage: 'error' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { message: 'Terjadi kesalahan server', activePage: 'error' });
});

// Start server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});