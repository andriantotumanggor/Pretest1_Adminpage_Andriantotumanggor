-- Buat database
CREATE DATABASE IF NOT EXISTS toko_retail;
USE toko_retail;

-- Tabel Produk
CREATE TABLE produk (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kode_produk VARCHAR(20) UNIQUE NOT NULL,
    nama_produk VARCHAR(100) NOT NULL,
    kategori VARCHAR(50),
    harga DECIMAL(10,2) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Stock Produk
CREATE TABLE stock_produk (
    id INT PRIMARY KEY AUTO_INCREMENT,
    produk_id INT NOT NULL,
    stock_awal INT NOT NULL DEFAULT 0,
    stock_masuk INT DEFAULT 0,
    stock_keluar INT DEFAULT 0,
    stock_akhir INT NOT NULL DEFAULT 0,
    tanggal_update DATE NOT NULL,
    FOREIGN KEY (produk_id) REFERENCES produk(id) ON DELETE CASCADE
);

-- Tabel Pembelian
CREATE TABLE pembelian (
    id INT PRIMARY KEY AUTO_INCREMENT,
    no_transaksi VARCHAR(50) UNIQUE NOT NULL,
    produk_id INT NOT NULL,
    jumlah INT NOT NULL,
    harga_satuan DECIMAL(10,2) NOT NULL,
    total_harga DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'diproses', 'selesai', 'dibatalkan') DEFAULT 'pending',
    tanggal_pembelian DATETIME DEFAULT CURRENT_TIMESTAMP,
    admin_id INT,
    catatan TEXT,
    FOREIGN KEY (produk_id) REFERENCES produk(id)
);

-- Tabel Admin (sederhana)
CREATE TABLE admin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(100),
    level ENUM('admin', 'superadmin') DEFAULT 'admin'
);

-- Insert data dummy produk (10 produk)
INSERT INTO produk (kode_produk, nama_produk, kategori, harga, deskripsi) VALUES
('PRD001', 'Laptop ASUS X441BA', 'Elektronik', 7500000, 'Laptop 14 inch, RAM 4GB, HDD 500GB'),
('PRD002', 'Mouse Wireless Logitech', 'Aksesoris', 250000, 'Mouse wireless dengan receiver USB'),
('PRD003', 'Keyboard Mechanical RGB', 'Aksesoris', 850000, 'Keyboard mechanical dengan backlight RGB'),
('PRD004', 'Monitor 24 inch LG', 'Elektronik', 2200000, 'Monitor Full HD 1920x1080'),
('PRD005', 'Kabel HDMI 2.0', 'Aksesoris', 150000, 'Kabel HDMI high speed 2 meter'),
('PRD006', 'Webcam 1080p', 'Elektronik', 500000, 'Webcam Full HD dengan microphone'),
('PRD007', 'Headset Gaming', 'Aksesoris', 350000, 'Headset dengan microphone dan LED'),
('PRD008', 'Flashdisk 64GB', 'Storage', 120000, 'Flashdisk USB 3.0 64GB'),
('PRD009', 'SSD 256GB', 'Storage', 650000, 'SSD SATA 256GB untuk upgrade laptop/PC'),
('PRD010', 'Router WiFi Dual Band', 'Jaringan', 450000, 'Router wireless AC1200');

-- Insert data dummy stock
INSERT INTO stock_produk (produk_id, stock_awal, stock_masuk, stock_keluar, stock_akhir, tanggal_update) VALUES
(1, 10, 5, 3, 12, CURDATE()),
(2, 50, 25, 30, 45, CURDATE()),
(3, 15, 10, 5, 20, CURDATE()),
(4, 8, 4, 2, 10, CURDATE()),
(5, 100, 50, 60, 90, CURDATE()),
(6, 20, 15, 10, 25, CURDATE()),
(7, 30, 20, 15, 35, CURDATE()),
(8, 200, 100, 120, 180, CURDATE()),
(9, 25, 15, 10, 30, CURDATE()),
(10, 18, 12, 8, 22, CURDATE());

-- Insert data admin (password: admin123)
INSERT INTO admin (username, password_hash, nama_lengkap, level) VALUES
('admin', '$2b$10$YourHashedPasswordHere', 'Admin Toko', 'admin');

-- Insert data dummy pembelian
INSERT INTO pembelian (no_transaksi, produk_id, jumlah, harga_satuan, total_harga, status, tanggal_pembelian) VALUES
('TRX001', 2, 5, 250000, 1250000, 'selesai', NOW()),
('TRX002', 5, 10, 150000, 1500000, 'selesai', NOW()),
('TRX003', 8, 20, 120000, 2400000, 'diproses', NOW()),
('TRX004', 1, 1, 7500000, 7500000, 'pending', NOW()),
('TRX005', 7, 3, 350000, 1050000, 'dibatalkan', NOW());