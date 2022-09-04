import React, { Component, useState, useEffect } from 'react';
import { Linking, TouchableOpacity, View, Text, StyleSheet, Button } from 'react-native';
import { Icon } from 'react-native-elements'

const CONFIG = require('../../config/app.config.js');

function EventsUpcomingCard (props) {
    if(Platform.OS === 'android') { // only android needs polyfill
        require('intl'); // import intl object
        require('intl/locale-data/jsonp/en-US'); // load the required locale details
    }

    const { event } = props;
    const date = new Date(event.eventdate);
    
    const optionsTime = { hour: 'numeric', minute: 'numeric' };
    const optionsDate = { weekday: 'short', month: 'long', day: 'numeric' };

    return(
        <View style={[styles.notifContainer]}>
                <View style={styles.notifCard_event}>
                    <View style={{flex: 2.5, flexDirection:'row', }}>
                        <View style={{paddingTop:5, alignItems: 'center'}}>
                            <Icon name='event' size={45}/>
                        </View>
                        <View style={{flex:2}}>
                            <Text style={styles.title}>{event.title} at {event.eventlocation}</Text>
                            {<Text style={styles.subtitle}>Created by {event.authorfname} {event.authorlname[0]}. </Text>}
                            <Text style={[styles.subtitle, {fontWeight: '500'}]}>Description: <Text style={{fontWeight: '400'}}>{event.descrip}</Text></Text>
                            {<Text style={styles.subtitle}>Approved by {event.approverfname} {event.approverlname[0]}. </Text>}
                            {/* <Text style={styles.subtitle}>Suggested: <Text style={{fontWeight: '500'}}>{date.toLocaleDateString('en-US', optionsDate)} at {date.toLocaleTimeString('en-US', optionsTime)}</Text> </Text> */}
                            { Platform.OS === 'ios' ?<Text style={styles.subtitle}>Suggested: <Text style={{fontWeight: '500'}}>{date.toLocaleDateString('en-US', optionsDate)} at {date.toLocaleTimeString('en-US', optionsTime)}</Text></Text> :
                            <Text style={styles.subtitle}>Suggested: <Text style={{fontWeight: 'bold'}}>{Intl.DateTimeFormat('en-US', optionsDate).format(date)} at {Intl.DateTimeFormat('en-US', optionsTime).format(date)}</Text></Text>}
                        </View>
                    </View>
                
                    <View style={{flex: 0.5, paddingRight: 4, alignItems: 'center', justifyContent: 'space-between',}}>
                        {/* <View style={{paddingRight: 3,}}> 
                            <Text>{event.createdate}</Text>
                        </View> */}
                        <View style={{paddingTop: 10, flexDirection:'row', justifyContent: 'space-around'}}>
                            {/* <Icon name="calendar-circle-plus"   type='font-awesome'/> */}
                            <Icon
                                raised
                                name="phone"
                                type='font-awesome'
                                color='purple'
                                onPress={() => Linking.openURL(`tel:${event.contact}`)} />
                        </View>
                    </View>
                </View>
            </View>
    );
}

export default EventsUpcomingCard;

const styles = StyleSheet.create({
    
    notifContainer: {
        // paddingTop:5,
        borderRadius: 5,
        backgroundColor: 'purple',
        marginBottom: 5,
    },

    notifCard_event: {
        flex: 1,
        flexDirection: 'row',
        borderBottomRightRadius: 5,
        borderTopRightRadius: 5,
        backgroundColor: '#f3f3f3', 
        padding: 5,
        marginLeft: 6,
        justifyContent:'space-between',
    },
    title: {
        paddingLeft:5,
        fontWeight: 'bold',
        fontSize: 16,
    },
    subtitle: {
        paddingLeft:5,
        fontSize: 13,

    }, 
});
