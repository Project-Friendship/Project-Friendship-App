import React, { useEffect, useState, useRef } from "react";
import { StatusBar } from 'expo-status-bar';
import { Alert, Platform, Image, TextInput, 
  Button, StyleSheet, Text, View } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from "expo-google-app-auth";
import { SocialIcon } from 'react-native-elements'
import { useIsFocused } from "@react-navigation/native";

import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import 'react-native-get-random-values';
import logo from './src/pf_logo.jpg'

import { getEmailFromSessionID } from "./GlobalFunctions/APICalls";

const CONFIG = require('../config/app.config.js');
const handlePress = require('./GlobalFunctions/HandlePress') 

import { v4 as uuidv4 } from 'uuid';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

_storeSessionID = async (sid) => {
  try {
    await AsyncStorage.setItem(
      'SID',
      sid
    );
  } catch (error) {
    // Error saving data
    console.log("There was an error saving your sid to AsyncStorage.")
  }
};

_retrieveSessionID = async () => {
  try {
    return await AsyncStorage.getItem('SID');
  } catch (error) {
    // Error retrieving data
    console.log("There was an error in retriving given sid from AsyncStorage");
    return;
  }
};



export default function LoginScreen(props) {
    const formContentType = CONFIG.formContentType;
    const isFocused = useIsFocused();

    const [sessionID, setSessionID] = useState(uuidv4());
    const [requestItems, setRequestItems] = useState([]);


    const [expoPushToken, setExpoPushToken] = useState('');
    // const [notification, setNotification] = useState(false);
    // const notificationListener = useRef();
    // const responseListener = useRef();

    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();


  useEffect( async () => {
    if (isFocused) {
      setSessionID(uuidv4());
  
      // here check async storage
      const sid = await _retrieveSessionID();
      if (sid){
        setSessionID(sid);
        // get email from sid,
        const email = await getEmailFromSessionID(sid);
        if (email) {
          handleNavigation(email, sid);
        } else {
          AsyncStorage.removeItem('SID');
          Alert.alert("Your session has been logged out.", "You logged onto another device with the same account, so we logged you out here. Please log in here again.")
          setDisableGoogle(false);
        }
        console.log("email from sid: " + sid + " : " + email)
        // handle navigation
      } else {
        console.log("No sid stored in AsyncStorage: login to store.");
        setDisableGoogle(false);
      }
  
      const getPermission = async () => {
        if (Constants.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
              const { status } = await Notifications.requestPermissionsAsync();
              finalStatus = status;
            }
            if (finalStatus !== 'granted') {
              alert('Enable push notifications in the systems settings to get notified!');
              setExpoPushToken("");
              return;
            }
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            setExpoPushToken(token);
        } else {
          alert('Must use physical device for Push Notifications');
        }
  
          if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
              name: 'default',
              importance: Notifications.AndroidImportance.MAX,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: '#FF231F7C',
            });
          }
      }
  
      getPermission();
  
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });
  
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {});
  
      return () => {
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
      };
    }
  }, [props, isFocused]);


  const sendPushNotification = async (token, title, body) => {
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

  const onClick = async () => {
    await sendPushNotification("ExponentPushToken[EHvE7CLDfTMKyEZ_aO15CU]", "TEST", "OMGOMGTEST");
  }

    const navigateHome = (sid, role) => { 
      console.log("Sign in successfull: navigating to new page...")
      return props.navigation.navigate('Home', { sid, role }); }

    const navigateRegister = () => { return props.navigation.navigate('RegisterScreen'); }
    
    
    const getRequests = async () => {
        setRequestItems([{}]);
        var ret = await handlePress('register', 'GET', { // adds into votes. 
            headers: {"Content-type": formContentType} });
        return await ret;
    }
    
    const navigateAdmin = async () => { 
      var output = await getRequests('register','GET');
      var users = [];
      await output.forEach(async(request) => {
        users.push(request);
      })
      setRequestItems(users);
    }

    const handleLogin = async (email) => {
      setSessionID(uuidv4());
      if (sessionID == null) {
        return alert("Some trouble logging in: Try again.")
      } 
      if (email.includes("@")) {
        //check if it's in database
        var user = await handlePress('users', 'PUT', {  
            headers: {"Content-type": formContentType}, body: `email=${email}&`});
        // console.log("user: line 51: "  + user  + " || user.emaiL: " + user.email);
        if (user.email) {
          // add to session table 
          await handlePress('sessions', 'DELETE', {  
            headers: {"Content-type": formContentType}, body: `sid=${sessionID}&email=${email}`});
          await handlePress('sessions', 'POST', {  
            headers: {"Content-type": formContentType}, body: `sid=${sessionID}&email=${email}&notiftoken=${expoPushToken}`});  
          // store into ASYNC 

          await _storeSessionID(sessionID);
          return 200;
        } else {
          alert("User does not exist in the database.");
          return 404;
        }
      } else {
        return 404;
      }
    }

    const handleNavigation = async(email, sid) => {
      const { role } = await handlePress('users', 'PUT', {  
        headers: {"Content-type": formContentType}, 
        body: `email=${email}`});
      // Then you can use the Google REST API
      if (role === 'admin') {
        await navigateAdmin();
        console.log("Admin login successful: navigating...")
      return props.navigation.navigate('RegistrationRequests', {users: requestItems});
      } else {
        return navigateHome(sid, role);
      }
    }

    /*
    * This function allows for google oauth and checks if user is 
    * in the database -- if not return error, if is navigate to Home.js
    */

    const [disableGoogle, setDisableGoogle] = useState(true);

    const signInAsync = async event => {
      // event.currentTarget.disabled = true;
      console.log("LoginScreen.js 6 | loggin in");
      try {
        const { type, user } = await Google.logInAsync({
	        iosClientId: `83414050974-8ekpa872o804mkbrbdpi0bo8nle9ckav.apps.googleusercontent.com`,
          androidClientId: `537101146129-776h84lg07qtg1v1hdaiupkk8e43ru2s.apps.googleusercontent.com`,
          androidStandaloneAppClientId: `83414050974-hla7fl5u5pn210ahhiv6i08avb512e1e.apps.googleusercontent.com`
        });

        // console.log(user);
        if (type === "success") {
          console.log("User.email is : " + user.email);
          var ret = await handleLogin(user.email);
          if (ret === 200) {
            // Then you can use the Google REST API
            console.log("LoginScreen.js 17 | success, navigating to profile");
            handleNavigation(user.email, sessionID);
            // check if admin, else navigate to home...
          } else {
            console.log("Unsuccessful Login...");
            setDisableGoogle(false);
            return 404;
          }
        } else {
          setDisableGoogle(false);
        }
      } catch (error) {
        console.log("LoginScreen.js 19 | error with login", error);
        setDisableGoogle(false);
      }

    };

    return (
        <View style={styles.container}>
          <Image source={logo} style={{ width: 200, height: 160, marginBottom: 75}} />
          <Text></Text> 
            <View style={styles.buttons}>
              <SocialIcon button iconSize={25} iconType="font-awesome"
                disabled={disableGoogle}
                onPress={() => { setDisableGoogle(true);
                  console.log("onPress() google");
                  signInAsync()}}
                style={{ paddingHorizontal: 15}}
                title="Sign In With Google" type="google"/>

              <Text>Your expo push token: {expoPushToken}</Text>
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text>Title: {notification && notification.request.content.title} </Text>
                <Text>Body: {notification && notification.request.content.body}</Text>
                <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
              </View>
              <Button
                title="Press to schedule a notification"
                onPress={async () => {
                  await onClick();
                }}/>
              {/* <SocialIcon button iconSize={25}
                iconType="font-awesome"
                style={{ paddingHorizontal: 15}}
                title="Sign In With Facebook" type="facebook"/> */}
          </View>
            <Button disabled={disableGoogle} title="Register with Gmail" onPress={navigateRegister} />
            {/* <Button title="Admin Login" onPress={navigateAdmin}/> */}
        <StatusBar style="auto" />
        </View>
    );
}



async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      setExpoPushToken("No token found: permission for push notification not granted.");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    setExpoPushToken(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 100,
  },
});
