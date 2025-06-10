// src/services/NotificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// הגדרת התנהגות ברירת מחדל
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  private static expoPushToken: string | null = null;

  /**
   * בקשת הרשאות והשגת token
   */
  static async registerForPushNotifications(): Promise<string | null> {
    let token = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2979FF',
        sound: 'default',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Push notification permissions not granted');
        return null;
      }

      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        
        if (!projectId) {
          console.log('Project ID not found');
          return null;
        }

        token = (await Notifications.getExpoPushTokenAsync({
          projectId,
        })).data;
        
        this.expoPushToken = token;
        console.log('Push Token:', token);
        
      } catch (error) {
        console.log('Error getting push token:', error);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  /**
   * תזמון notification מקומי
   */
  static async scheduleLocalNotification(
    title: string,
    body: string,
    triggerDate: Date,
    data?: any
  ): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: 'date',
        date: triggerDate,
      } as Notifications.DateTriggerInput,
    });

    return notificationId;
  }

  /**
   * ביטול notification מתוזמן
   */
  static async cancelScheduledNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * ביטול כל הnotifications המתוזמנים
   */
  static async cancelAllScheduledNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * קבלת כל הnotifications המתוזמנים
   */
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * שליחת push notification דרך Expo Push API
   */
  static async sendPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data?: any
  ): Promise<boolean> {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high' as const,
      channelId: 'default',
    };

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('Push notification sent:', result);
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  /**
   * הגדרת listeners לnotifications
   */
  static setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ) {
    const receivedListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      onNotificationReceived?.(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      onNotificationResponse?.(response);
    });

    return {
      receivedListener,
      responseListener,
      remove: () => {
        receivedListener.remove();
        responseListener.remove();
      }
    };
  }

  /**
   * קבלת הtoken הנוכחי
   */
  static getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
}

export default NotificationService;