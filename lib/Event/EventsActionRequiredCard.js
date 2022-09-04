import React, { Component, useState, useEffect } from 'react';
import { Alert, TouchableOpacity, View, Text, StyleSheet, Button, Platform } from 'react-native';
import { Icon } from 'react-native-elements'

import EventEditingForm from './EventEditingForm.js';

const CONFIG = require('../../config/app.config.js');
const handlePress = require('../GlobalFunctions/HandlePress') 
const timeSince = require('../GlobalFunctions/TimeSince')

function EventCard (props) {
    if(Platform.OS === 'android') { // only android needs polyfill
        require('intl'); // import intl object
        require('intl/locale-data/jsonp/en-US'); // load the required locale details
    }

    const logo = CONFIG.logo;

    const formContentType = CONFIG.formContentType;

    const [creator, setCreator] = useState(null); 
    const [confirmed, setConfirmed] = useState(false);

    const { email, isEventAuthor, event, bannerStyle, fetchInfo,
        setLoggingModalVisible, setLogEvent } = props;
    const eventDate = new Date(event.eventdate);
    const cDate = new Date(event.eventcreated);
    const createdDate = timeSince(cDate);
    const [date, setDate] = useState(eventDate);

    const [eid, setEID] = useState(event.eid);

    const optionsTime = { hour: 'numeric', minute: 'numeric' };
    const optionsDate = { weekday: 'short', month: 'long', day: 'numeric' };

    const [eventEditingFormModalVisible, setEventEditingFormModalVisible] = useState(false);


    const pressConfirm = async () => {
        if (bannerStyle.buttonTitle === "close") { // Did you complete this event notification
            // setConfirmed(true);
            // await Alert.prompt("Event Logging", "Please type the duration of the event (enter numbers only).")
            setLogEvent(event);
            setLoggingModalVisible(true);
            return setConfirmed(true);
        } 
        
        // else, it's asking for event approval 
        console.log("Confirm pressed.");
        setConfirmed(true);
        bannerStyle.checkButton = false;
        // delete event
        await handlePress('events', 'DELETE', { 
            headers: {"Content-type": formContentType},
            body: `eid=${eid}`});

        await handlePress('events', 'POST', { 
            headers: {"Content-type": formContentType},
            body: `author=${event.author}&cid=${event.cid}&stat=${'approved'}&title=${event.title}&descrip=${event.descrip}&eventDate=${event.eventdate}&eventCreated=${event.eventcreated}&eventLocation=${event.eventlocation}&approvedBy=${email}`});
    }



    const pressEditOrClose = async () => {
        if (bannerStyle.buttonTitle === "close") {
            setConfirmed(true);
            return Alert.prompt("Not logging this event?", "Please type a reason why this event was not attended.")
        }
        console.log("Edit pressed.");
        setEventEditingFormModalVisible(true);
    }

    return(
        <View>
            <EventEditingForm eventEditingFormModalVisible={eventEditingFormModalVisible} setConfirmed={setConfirmed}
                setEventEditingFormModalVisible={setEventEditingFormModalVisible} setEID={setEID}
                email={email} value={event.cid} event={event} setDateOnCard={setDate} date={date}/>

            <View style={[styles.notifContainer, {backgroundColor: `${bannerStyle.color}`}]}>
                <View style={styles.notifCard_event}>
                    <View style={{flex: 2.5, flexDirection:'row', }}>
                        <View style={{paddingTop:5, alignItems: 'center'}}>
                            <Icon name={bannerStyle.iconTitle} size={45}/>
                        </View>
                        <View style={{flex:2}}>
                            <Text style={styles.title}>{bannerStyle.title}</Text>
                            <Text style={[styles.subtitle, {fontWeight: '500'}]}>To {bannerStyle.authorStr}: <Text style={{fontWeight: '400'}}>{event.descrip}</Text></Text>
                            {!isEventAuthor && <Text style={styles.subtitle}>Created by {event.authorfname} {event.authorlname[0]}., 
                            ({event.childfname} {event.childlname[0]}'s {event.authorrole}). </Text>}
                            
                            { Platform.OS === 'ios' ?<Text style={styles.subtitle}>Suggested: <Text style={{fontWeight: '500'}}>{date.toLocaleDateString('en-US', optionsDate)} at {date.toLocaleTimeString('en-US', optionsTime)}</Text></Text> :
                            <Text style={styles.subtitle}>Suggested: <Text style={{fontWeight: 'bold'}}>{Intl.DateTimeFormat('en-US', optionsDate).format(date)} at {Intl.DateTimeFormat('en-US', optionsTime).format(date)}</Text></Text>}
                        </View>
                    </View>
                
                    <View style={{flex: 0.5, paddingRight: 4, alignItems: 'flex-end', justifyContent: 'space-between',}}>
                        <View style={{paddingRight: 3,}}> 
                            <Text>{createdDate}</Text>
                        </View>
                        <View style={{paddingTop: 10, flexDirection:'row', justifyContent: 'space-around'}}>
                            {bannerStyle.checkButton && !confirmed && <TouchableOpacity style={{paddingRight: 5}} onPress={()=>{ pressConfirm() }}>
                                <Icon name='done' color='green' size={25}/>
                            </TouchableOpacity>}

                            {!confirmed && <TouchableOpacity style={{}} onPress={()=>{ pressEditOrClose() }}>
                                <Icon name={bannerStyle.buttonTitle} color={logo.red} size={25}/>
                            </TouchableOpacity>}
                            {confirmed && <Text></Text>}

                        </View>
                    </View>
                </View>
            </View>
        </View>
        
    );
}

export default EventCard;

const styles = StyleSheet.create({
    
    eventcontainer: {
        backgroundColor: 'lightpink',
        padding: 10,
        marginRight: 30,
        width: '100%',
        borderRadius: 5,
        paddingBottom: -20,
    },

    notifContainer: {
        marginTop:7,
        borderRadius: 6,
        width: '100%',
        backgroundColor: '#E6000C'
    },

    notifCard_event: {
        flex: 1,
        flexDirection: 'row',
        width: '100%',
        borderBottomRightRadius: 13.75,
        borderTopRightRadius: 13.75,
        backgroundColor: '#f3f3f3', 
        padding: 5,
        marginLeft: 6,
        justifyContent:'space-between',
    },
    title: {
        paddingTop: 0,
        paddingLeft:5,
        fontWeight: 'bold',
        fontSize: 16,
    },
    subtitle: {
        paddingLeft:5,
        fontSize: 13,

    }, 

});



{/*  */}