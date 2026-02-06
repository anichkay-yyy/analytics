import { Request, Response } from 'express';
import webpush from 'web-push';

// In-memory storage for push subscriptions
// TODO: Move to database (Prisma model) for production
const subscriptions = new Map<string, webpush.PushSubscription>();

// Configure VAPID details
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@anichkay.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    vapidEmail,
    vapidPublicKey,
    vapidPrivateKey
  );
  console.log('✓ Web Push configured with VAPID keys');
} else {
  console.warn('⚠ VAPID keys not configured. Push notifications will not work.');
}

/**
 * Get VAPID public key
 */
export const getVapidPublicKey = (req: Request, res: Response) => {
  if (!vapidPublicKey) {
    return res.status(500).json({
      error: 'VAPID keys not configured'
    });
  }

  res.json({ publicKey: vapidPublicKey });
};

/**
 * Subscribe to push notifications
 */
export const subscribe = async (req: Request, res: Response) => {
  try {
    const subscription = req.body as webpush.PushSubscription;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        error: 'Invalid subscription data'
      });
    }

    // Store subscription (using endpoint as unique key)
    subscriptions.set(subscription.endpoint, subscription);

    console.log(`✓ New push subscription: ${subscription.endpoint}`);
    console.log(`Total subscriptions: ${subscriptions.size}`);

    res.json({
      success: true,
      message: 'Subscription saved'
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      error: 'Failed to save subscription'
    });
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        error: 'Endpoint required'
      });
    }

    const deleted = subscriptions.delete(endpoint);

    console.log(`${deleted ? '✓' : '✗'} Unsubscribed: ${endpoint}`);
    console.log(`Total subscriptions: ${subscriptions.size}`);

    res.json({
      success: deleted,
      message: deleted ? 'Unsubscribed' : 'Subscription not found'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      error: 'Failed to unsubscribe'
    });
  }
};

/**
 * Send push notification to all subscribers
 */
export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { title, body, url, icon, badge } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        error: 'Title and body required'
      });
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      return res.status(500).json({
        error: 'VAPID keys not configured'
      });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icons/icon-192.png',
      badge: badge || '/icons/icon-72.png',
      data: { url: url || '/' },
    });

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send to all subscriptions
    const promises = Array.from(subscriptions.entries()).map(
      async ([endpoint, subscription]) => {
        try {
          await webpush.sendNotification(subscription, payload);
          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`${endpoint}: ${error.message}`);

          // Remove invalid subscriptions (410 = Gone)
          if (error.statusCode === 410) {
            subscriptions.delete(endpoint);
            console.log(`✗ Removed invalid subscription: ${endpoint}`);
          }
        }
      }
    );

    await Promise.all(promises);

    console.log(`✓ Sent notification to ${results.success} subscribers`);
    if (results.failed > 0) {
      console.warn(`✗ Failed to send to ${results.failed} subscribers`);
    }

    res.json({
      success: true,
      sent: results.success,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      error: 'Failed to send notification'
    });
  }
};

/**
 * Get subscription stats
 */
export const getStats = (req: Request, res: Response) => {
  res.json({
    totalSubscriptions: subscriptions.size,
    configured: !!(vapidPublicKey && vapidPrivateKey),
  });
};
