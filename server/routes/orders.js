import express from 'express';
import Order from '../models/Order.js';
import { sendTelegramNotification } from '../utils/telegram.js';

const router = express.Router();

/**
 * POST /api/orders
 * Create a new COD order for Hismile product
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

    // Product data for Hismile (hardcoded)
    const productData = {
      productName: 'Hismile™ – Le Sérum Qui Blanchis tes dents dès le premier jour',
      productPrice: quantity === 1 ? '9,900 FCFA' : '14,000 FCFA',
      productImages: [],
      productShortDesc: 'Sérum correcteur de teinte pour les dents. Effet instantané, sans peroxyde.',
      productFullDesc: '',
      productBenefits: [],
      productUsage: '',
      productGuarantee: 'Il est recommandé par les dentistes du Cameroun et du monde entier.',
      productDeliveryInfo: '',
      productReviews: [],
    };

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

    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('💾 SAUVEGARDE COMMANDE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 Commande à sauvegarder:', {
      name: order.name,
      phone: order.phone,
      city: order.city,
      productName: order.productName,
      quantity: order.quantity,
      totalPrice: order.totalPrice,
    });
    
    await order.save();
    console.log('✅ Commande sauvegardée avec succès dans MongoDB');
    console.log('🆔 ID de la commande:', order._id);

    // Préparer les données de notification pour Telegram (en arrière-plan)
    const notificationData = {
      name: order.name,
      phone: order.phone,
      product: order.productName,
      price: totalPrice,
      city: order.city,
    };

    // ENVOYER LA RÉPONSE IMMÉDIATEMENT (avant Telegram)
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

    // Envoyer Telegram en arrière-plan SANS attendre la réponse
    // La réponse HTTP est déjà envoyée, on ne bloque plus rien
    process.nextTick(() => {
      console.log('📱 Envoi Telegram en arrière-plan (non-bloquant)...');
      // Envoyer sans await - la promesse se résout en arrière-plan
      sendTelegramNotification(notificationData)
        .then((telegramResult) => {
          if (telegramResult.success) {
            console.log(`✅ Telegram envoyé: ${telegramResult.successCount}/${telegramResult.failCount + telegramResult.successCount} destinataire(s)`);
          } else {
            // Ne pas logger les erreurs de timeout, c'est normal en arrière-plan
            if (telegramResult.error && !telegramResult.error.includes('Timeout')) {
              console.log(`⚠️  Telegram: ${telegramResult.failCount} échec(s)`);
            }
          }
        })
        .catch((telegramError) => {
          // Ignorer silencieusement les erreurs en arrière-plan
          // Les logs détaillés sont déjà dans sendTelegramNotification
        });
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

