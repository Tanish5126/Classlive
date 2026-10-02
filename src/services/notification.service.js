// Push notification service using modular Firebase Cloud Messaging (FCM)
const { getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const { messaging } = require('../config/firebase');

/**
 * Sends a push notification to students subscribed to a class topic: "class_<classId>"
 * Supports FCM_DRY_RUN=true to validate payload without delivering messages.
 * Never throws errors; catches and returns { success, error }.
 *
 * @param {Object|string} optionsOrClassId - Options object { classId, title, body, data } or classId string
 * @param {string} [titleArg] - Notification title (if using positional args)
 * @param {string} [bodyArg] - Notification body (if using positional args)
 * @param {Object} [dataArg] - Additional custom data payload (optional)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendClassNotification = async (optionsOrClassId, titleArg, bodyArg, dataArg) => {
  try {
    let classId, title, body, data;

    if (typeof optionsOrClassId === 'object' && optionsOrClassId !== null) {
      ({ classId, title, body, data = {} } = optionsOrClassId);
    } else {
      classId = optionsOrClassId;
      title = titleArg;
      body = bodyArg;
      data = dataArg || {};
    }

    const messagingInstance = messaging || (getApps().length > 0 ? getMessaging() : null);

    if (!messagingInstance) {
      console.warn('FCM skipped: Firebase messaging is not configured on the server');
      return {
        success: false,
        error: 'Firebase messaging is not configured'
      };
    }

    // FCM_DRY_RUN=true validates payload with Firebase servers without sending actual notification
    const dryRun = process.env.FCM_DRY_RUN === 'true';

    // FCM data values must be strings
    const stringifiedData = {};
    for (const [key, value] of Object.entries(data)) {
      stringifiedData[key] = String(value);
    }
    stringifiedData.classId = String(classId);

    const message = {
      topic: `class_${classId}`,
      notification: {
        title,
        body
      },
      data: stringifiedData
    };

    // Send push notification using modular Messaging instance
    const response = await messagingInstance.send(message, dryRun);

    return {
      success: true,
      messageId: response
    };
  } catch (error) {
    console.error('FCM notification error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendClassNotification
};
module.exports.sendClassNotification = sendClassNotification;
