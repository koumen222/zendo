import express from 'express';
import Order from '../models/Order.js';
import { scrapeProduct } from '../utils/scraper.js';

const router = express.Router();

/**
 * POST /api/orders
 * Create a new COD order with product scraping
 */
router.post('/', async (req, res) => {
  try {
    const { name, phone, city, address = '', productSlug, quantity = 1 } = req.body;

    // Validation
    if (!name || !phone || !city || !productSlug) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis (name, phone, city, productSlug)',
      });
    }

    // Scrape product data
    let productData = {};
    try {
      productData = await scrapeProduct(productSlug);
    } catch (scrapeError) {
      console.error('Scraping error:', scrapeError);
      // Continue with order creation even if scraping fails
      productData = {
        productName: `Produit ${productSlug}`,
        productPrice: 'Prix non disponible',
        productImages: [],
        productShortDesc: '',
        productFullDesc: '',
        productBenefits: [],
        productUsage: '',
        productGuarantee: '',
        productDeliveryInfo: '',
        productReviews: [],
      };
    }

    // Calculer le prix total
    let totalPrice = '';
    if (quantity === 1) {
      totalPrice = '9,900 FCFA';
    } else if (quantity === 2) {
      totalPrice = '14,000 FCFA';
    } else {
      totalPrice = `${(quantity * 9900).toLocaleString('fr-FR')} FCFA`;
    }

    // Create order
    const order = new Order({
      name: name.trim(),
      phone: phone.trim(),
      city: city.trim(),
      address: address.trim(),
      productSlug: productSlug.trim(),
      quantity: parseInt(quantity) || 1,
      totalPrice,
      ...productData,
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      order: {
        id: order._id,
        name: order.name,
        phone: order.phone,
        city: order.city,
        productName: order.productName,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande',
      error: error.message,
    });
  }
});

export default router;

