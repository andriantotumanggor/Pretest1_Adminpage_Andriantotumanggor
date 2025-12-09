const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Middleware sederhana untuk autentikasi
const isAuthenticated = (req, res, next) => {
    // Untuk demo, kita skip authentication
    next();
};

// Dashboard
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const [produk] = await db.query('SELECT COUNT(*) as total FROM produk');
        const [pembelian] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) as selesai,
                SUM(CASE WHEN status = 'dibatalkan' THEN 1 ELSE 0 END) as dibatalkan
            FROM pembelian
        `);
        const [stock] = await db.query('SELECT SUM(stock_akhir) as total FROM stock_produk');
        
        res.render('index', {
            title: 'Dashboard Admin',
            activePage: 'dashboard',
            totalProduk: produk[0].total,
            totalPembelian: pembelian[0].total,
            pembelianSelesai: pembelian[0].selesai,
            pembelianDibatalkan: pembelian[0].dibatalkan,
            totalStock: stock[0].total
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Gagal memuat dashboard', activePage: 'error' });
    }
});

// Halaman Produk
router.get('/produk', isAuthenticated, async (req, res) => {
    try {
        const [produk] = await db.query(`
            SELECT p.*, s.stock_akhir 
            FROM produk p 
            LEFT JOIN stock_produk s ON p.id = s.produk_id
            ORDER BY p.created_at DESC
        `);
        res.render('produk', {
            title: 'Daftar Produk',
            activePage: 'produk',
            produk: produk
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Gagal memuat data produk' });
    }
});

// Halaman Stock
router.get('/stock', isAuthenticated, async (req, res) => {
    try {
        const [stock] = await db.query(`
            SELECT p.kode_produk, p.nama_produk, s.* 
            FROM stock_produk s 
            JOIN produk p ON s.produk_id = p.id
            ORDER BY s.tanggal_update DESC
        `);
        res.render('stock', {
            title: 'Management Stock',
            activePage: 'stock',
            stock: stock
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Gagal memuat data stock' });
    }
});

// Halaman Pembelian
router.get('/pembelian', isAuthenticated, async (req, res) => {
    try {
        const status = req.query.status || 'all';
        let query = `
            SELECT pb.*, p.kode_produk, p.nama_produk 
            FROM pembelian pb 
            JOIN produk p ON pb.produk_id = p.id
        `;
        
        if (status !== 'all') {
            query += ` WHERE pb.status = '${status}'`;
        }
        
        query += ' ORDER BY pb.tanggal_pembelian DESC';
        
        const [pembelian] = await db.query(query);
        res.render('pembelian', {
            title: 'Management Pembelian',
            activePage: 'pembelian',
            pembelian: pembelian,
            currentStatus: status
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Gagal memuat data pembelian' });
    }
});

// Tambah Pembelian
router.post('/pembelian/tambah', isAuthenticated, async (req, res) => {
    try {
        const { produk_id, jumlah, harga_satuan, catatan } = req.body;
        const no_transaksi = `TRX${Date.now()}`;
        const total_harga = jumlah * harga_satuan;
        
        await db.query(
            'INSERT INTO pembelian (no_transaksi, produk_id, jumlah, harga_satuan, total_harga, catatan) VALUES (?, ?, ?, ?, ?, ?)',
            [no_transaksi, produk_id, jumlah, harga_satuan, total_harga, catatan]
        );
        
        res.redirect('/pembelian?status=pending');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Gagal menambah pembelian' });
    }
});

// Update Status Pembelian
router.post('/pembelian/update-status', isAuthenticated, async (req, res) => {
    try {
        const { id, status } = req.body;
        
        await db.query(
            'UPDATE pembelian SET status = ? WHERE id = ?',
            [status, id]
        );
        
        // Jika status dibatalkan atau selesai, update stock
        if (status === 'dibatalkan' || status === 'selesai') {
            const [pembelian] = await db.query(
                'SELECT produk_id, jumlah FROM pembelian WHERE id = ?',
                [id]
            );

            if (pembelian.length > 0) {
                const { produk_id, jumlah } = pembelian[0];
                const operator = status === 'selesai' ? '+' : '-';

                await db.query(`
                    UPDATE stock_produk
                    SET stock_keluar = stock_keluar ${operator} ?,
                        stock_akhir = stock_akhir ${operator === '+' ? '-' : '+'} ?
                    WHERE produk_id = ?
                `, [jumlah, jumlah, produk_id]);
            }
        }
        
        res.redirect('/pembelian');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Gagal mengupdate status pembelian' });
    }
});

// Get produk untuk dropdown
router.get('/api/produk', isAuthenticated, async (req, res) => {
    try {
        const [produk] = await db.query('SELECT id, kode_produk, nama_produk, harga FROM produk');
        res.json(produk);
    } catch (error) {
        res.status(500).json({ error: 'Gagal memuat data produk' });
    }
});

// Get detail produk
router.get('/api/produk/:id', isAuthenticated, async (req, res) => {
    try {
        const [produk] = await db.query(
            'SELECT id, kode_produk, nama_produk, harga FROM produk WHERE id = ?',
            [req.params.id]
        );
        
        if (produk.length > 0) {
            res.json(produk[0]);
        } else {
            res.status(404).json({ error: 'Produk tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Gagal memuat detail produk' });
    }
});

module.exports = router;