import * as Notifications from 'expo-notifications';
const APICalls = require('../GlobalFunctions/APICalls') 

Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

export const notify = async (email, title, body) => {
    let {notiftoken} = await APICalls.getNotifTokenByEmail(email);
    await sendPushNotification(notiftoken, title, body);
    return;
}

export const sendPushNotification = async (token, title, body) => {
    return fetch('https://exp.host/--/api/v2/push/send', {
      body: JSON.stringify({
        to: token,
        title: title,
        body: body,
        data: { message: `${title} - ${body}` },
        sound: "default",
        icon: "/assets/favicon.png",
        android:{
          icon: "/assets/favicon.png",
          sound:"default"
      }
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  }