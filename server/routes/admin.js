import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

/**
 * Middleware to check admin key
 */
const checkAdminKey = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const validKey = process.env.ADMIN_KEY || 'ZENDO_ADMIN_2026';

  if (!adminKey || adminKey !== validKey) {
    return res.status(401).json({
      success: false,
      message: 'Accès non autorisé. Clé admin requise.',
    });
  }

  next();
};

/**
 * GET /api/admin/orders
 * Get all orders (admin only)
 */
router.get('/orders', checkAdminKey, async (req, res) => {
  try {
    const { page = 1, limit = 50, sort = '-createdAt' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find()
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Order.countDocuments();

    res.json({
      success: true,
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Admin orders fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes',
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/orders/:id
 * Get single order details (admin only)
 */
router.get('/orders/:id', checkAdminKey, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée',
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Admin order fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la commande',
      error: error.message,
    });
  }
});

/**
 * PATCH /api/admin/orders/:id/status
 * Update order status (admin only)
 * NOTE: Cette route doit être définie AVANT /orders/:id pour éviter les conflits
 */
router.patch('/orders/:id/status', checkAdminKey, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Statuts valides: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée',
      });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: 'Statut de la commande mis à jour',
      order,
    });
  } catch (error) {
    console.error('Admin order status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message,
    });
  }
});

/**
 * PUT /api/admin/orders/:id
 * Update an order (admin only)
 */
router.put('/orders/:id', checkAdminKey, async (req, res) => {
  try {
    const { name, phone, city, address, quantity, totalPrice, status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée',
      });
    }

    // Mise à jour des champs fournis
    if (name !== undefined) order.name = name.trim();
    if (phone !== undefined) order.phone = phone.trim();
    if (city !== undefined) order.city = city.trim();
    if (address !== undefined) order.address = address.trim();
    if (quantity !== undefined) order.quantity = parseInt(quantity) || 1;
    if (totalPrice !== undefined) order.totalPrice = totalPrice;
    if (status !== undefined && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      order.status = status;
    }

    await order.save();

    res.json({
      success: true,
      message: 'Commande mise à jour avec succès',
      order,
    });
  } catch (error) {
    console.error('Admin order update error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la commande',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/orders/:id
 * Delete an order (admin only)
 */
router.delete('/orders/:id', checkAdminKey, async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log('🗑️  Tentative de suppression de la commande:', orderId);

    // Vérifier que l'ID est valide
    if (!orderId || orderId.length !== 24) {
      return res.status(400).json({
        success: false,
        message: 'ID de commande invalide',
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      console.log('❌ Commande non trouvée:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée',
      });
    }

    await Order.findByIdAndDelete(orderId);
    console.log('✅ Commande supprimée avec succès:', orderId);

    res.json({
      success: true,
      message: 'Commande supprimée avec succès',
    });
  } catch (error) {
    console.error('❌ Admin order delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la commande',
      error: error.message,
    });
  }
});

export default router;

