import React, { useState, useEffect, Component } from 'react';
import { Button, ScrollView, Text, View, StyleSheet } from 'react-native';

import DirectoryCard from './DirectoryCard';
// import RegistrationRequest from './RegistrationRequests';

const Directory = (props) => {  

    const url='http://192.168.1.214:3001';  
    const formContentType = "application/x-www-form-urlencoded;charset=UTF-8";
          
    const [directoryItems, setDirectoryItems] = useState([]);
    const handlePressDirectory = (op, method = '', params = {}) => {
        if (method != '')
            params.method = method;
        fetch(url + '/'+op, params)
            .then((response) => response.json()) // response.json()
            .then((responseText) => { 
                console.log(responseText);
                setDirectoryItems(responseText);
            })
            .catch((error) => { console.error(error);});}
    
    useEffect(() => {
        handlePressDirectory('users','GET');
    }, []);
    
    return( 
        <View style={styles.container}>
            <Text style={{fontSize: 20}}>USER DIRECTORY</Text>  
            <ScrollView style={{width: '100%'}}>
                { directoryItems.map((item, index) => {
                    return <DirectoryCard key={index} user={item}/> }) } 
            </ScrollView>
            <Button title='Registration Requests' onPress={()=>props.navigation.navigate('RegistrationRequests')}/>
            <View style= {{height: 30}}></View>
        </View> );
}

export default Directory;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      paddingTop: 50,
    },
});