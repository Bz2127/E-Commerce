const { pool } = require('../config/db');
const path = require('path');

/* =========================
   GET CART
========================= */
const getCart = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const [cartItems] = await pool.query(`
      SELECT 
        c.variant_id,
        c.quantity,
        pv.price,
        pv.stock_quantity,
        p.id AS product_id,
        p.name,
        p.image_url,
        p.brand,
        u.business_name
      FROM cart c
      JOIN product_variants pv ON c.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `, [req.user.id]);

    // Fix image URLs
    cartItems.forEach(item => {
      if (item.image_url && !item.image_url.startsWith('http')) {
        item.image_url = `http://localhost:5000/uploads/${path.basename(item.image_url)}`;
      }
    });

    res.json({ cart: cartItems });

  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};


/* =========================
   ADD TO CART
========================= */
const addToCart = async (req, res) => {
  try {
    const { variant_id, quantity = 1 } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!variant_id || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid product or quantity' });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Check stock
      const [variant] = await connection.query(
        `SELECT stock_quantity FROM product_variants WHERE id = ?`,
        [variant_id]
      );

      if (variant.length === 0) {
        return res.status(404).json({ error: 'Product variant not found' });
      }

      if (variant[0].stock_quantity < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }

      // Check existing cart item
      const [existing] = await connection.query(
        `SELECT quantity FROM cart WHERE user_id = ? AND variant_id = ?`,
        [req.user.id, variant_id]
      );

      if (existing.length > 0) {
        await connection.query(
          `UPDATE cart 
           SET quantity = quantity + ? 
           WHERE user_id = ? AND variant_id = ?`,
          [quantity, req.user.id, variant_id]
        );
      } else {
        await connection.query(
          `INSERT INTO cart (user_id, variant_id, quantity)
           VALUES (?, ?, ?)`,
          [req.user.id, variant_id, quantity]
        );
      }

      await connection.commit();

      res.json({
        success: true,
        message: 'Product added to cart'
      });

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
};


/* =========================
   UPDATE CART QUANTITY
========================= */
const updateCartQuantity = async (req, res) => {
  try {
    const { variant_id, quantity } = req.body;

    if (!req.user?.id || quantity < 0) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Remove if quantity = 0
    if (quantity === 0) {
      await pool.query(
        `DELETE FROM cart WHERE user_id = ? AND variant_id = ?`,
        [req.user.id, variant_id]
      );

      return res.json({
        success: true,
        message: 'Item removed from cart'
      });
    }

    await pool.query(
      `UPDATE cart 
       SET quantity = ?
       WHERE user_id = ? AND variant_id = ?`,
      [quantity, req.user.id, variant_id]
    );

    res.json({
      success: true,
      message: 'Cart updated'
    });

  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ error: 'Failed to update cart' });
  }
};


/* =========================
   REMOVE ITEM
========================= */
const removeFromCart = async (req, res) => {
  try {
    const { variant_id } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await pool.query(
      `DELETE FROM cart WHERE user_id = ? AND variant_id = ?`,
      [req.user.id, variant_id]
    );

    res.json({
      success: true,
      message: 'Item removed from cart'
    });

  } catch (err) {
    console.error('Remove cart error:', err);
    res.status(500).json({ error: 'Failed to remove item' });
  }
};


/* =========================
   CLEAR CART
========================= */
const clearCart = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await pool.query(
      `DELETE FROM cart WHERE user_id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Cart cleared'
    });

  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};
const syncCart = async (req, res) => {
    try {
        const user_id = req.user.id; 
        const { cart } = req.body;

        // 1. Delete using user_id 
        await pool.query('DELETE FROM cart WHERE user_id = ?', [user_id]);

        // 2. Insert if items exist
        if (cart && cart.length > 0) {
            const values = cart.map(item => [
                user_id, 
                item.variant_id, 
                item.quantity || 1
            ]);
            await pool.query(
                'INSERT INTO cart (user_id, variant_id, quantity) VALUES ?',
                [values]
            );
        }

        res.json({ success: true, message: "Cart synced successfully" });
    } catch (err) {
        console.error("Sync Error:", err);
        res.status(500).json({ error: "Failed to sync cart to database" });
    }
};


module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  syncCart
};