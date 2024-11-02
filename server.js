// server.js
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'ecoshop_india',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Successfully connected to database');
    connection.release();
});

// API Routes

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const [products] = await db.promise().query(`
            SELECT p.*, GROUP_CONCAT(pt.tag) as tags
            FROM products p
            LEFT JOIN product_tags pt ON p.id = pt.product_id
            GROUP BY p.id
        `);
        
        // Format the products data
        const formattedProducts = products.map(product => ({
            ...product,
            tags: product.tags ? product.tags.split(',') : []
        }));
        
        res.json(formattedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new order
app.post('/api/orders', async (req, res) => {
    const { userId, items, totalAmount, totalCarbonImpact } = req.body;
    
    try {
        const connection = await db.promise().getConnection();
        await connection.beginTransaction();
        
        try {
            // Create order
            const [orderResult] = await connection.query(
                'INSERT INTO orders (user_id, total_amount, total_carbon_impact) VALUES (?, ?, ?)',
                [userId, totalAmount, totalCarbonImpact]
            );
            
            // Insert order items
            for (const item of items) {
                await connection.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price_at_time, carbon_impact) VALUES (?, ?, ?, ?, ?)',
                    [orderResult.insertId, item.id, item.quantity, item.price, item.carbonEmission * item.quantity]
                );
            }
            
            // Update user statistics
            await connection.query(
                'UPDATE users SET carbon_saved = carbon_saved + ?, sustainable_purchases = sustainable_purchases + 1 WHERE id = ?',
                [totalCarbonImpact, userId]
            );
            
            await connection.commit();
            res.json({ orderId: orderResult.insertId });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user profile
app.get('/api/users/:userId', async (req, res) => {
    try {
        const [user] = await db.promise().query(
            'SELECT id, name, email, member_since, carbon_saved, sustainable_purchases FROM users WHERE id = ?',
            [req.params.userId]
        );
        
        if (!user.length) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const [milestones] = await db.promise().query(
            'SELECT id, title, completed, progress FROM milestones WHERE user_id = ?',
            [req.params.userId]
        );
        
        res.json({
            ...user[0],
            milestones
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});