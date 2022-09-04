import React, { useState } from 'react';
import { TimePicker } from 'react-native-simple-time-picker';
import { Dimensions, Button, View, StyleSheet, ScrollView, Modal, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';

import EventsActionRequiredCard from './EventsActionRequiredCard.js';
import { Platform } from 'react-native';

const  { logo } = require('../../config/app.config.js');
const APICalls = require('../GlobalFunctions/APICalls');
const windowWidth = Dimensions. get('window').width;
var deviceHeight = Dimensions.get('window').height

function EventsRequests(props) {
    const { email, role, eventsArray, 
        approvedAndPastEvents, arrlen, fetchInfo } = props;
    const totalEvents = approvedAndPastEvents.concat(eventsArray);
    // console.log(totalEvents)

    const [loggingModalVisible, setLoggingModalVisible] = useState(false);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [logEvent, setLogEvent] = useState({});

    const handleChange = (hours, minutes) => {
      setHours(hours);
      setMinutes(minutes);
    };
    const handleReset = () => {
      setHours(0);
      setMinutes(0);
    };
    
    const createLog = async () => {
        console.log(logEvent.eid);

        let dur = hours + Math.round(minutes/60  * 100) / 100;

        // handle if dur time is equal to 0, then suggest changing time...
        if(dur === 0) {
            return alert("Please chose a time that is greater than 0 minutes.")
        }

        // update event to complete
        
        // update event to display completed:
        await APICalls.deleteEventByEID(logEvent.eid);
        await APICalls.completeEvent(logEvent);
        // console.log(logEvent.eventlocation)
        const { cid, descrip, eventlocation } = logEvent;
        var newEID = await APICalls.getEIDByInfo(cid, descrip, eventlocation);
        // console.log("neweid:::: "+newEID.eid)
        await APICalls.createEventLog(newEID, email, dur);
        
        // reset values, close event logging modal
        setLoggingModalVisible(false);
        return handleReset();
    } 

    return (
        <View style={styles.card}> 
                <Modal
                animationType="slide"
                transparent={true}
                visible={loggingModalVisible}
                onRequestClose={() => {
                Alert.alert("Modal has been closed.");
                setLoggingModalVisible(!loggingModalVisible); }}>

                <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={{fontSize: 30, paddingBottom: 10,
                        fontWeight: 'bold', color: logo.blue, marginTop: 10}}>Log Event</Text>

                <Text>Select hours and minutes of duration of your event.</Text>
                <Text style={{fontSize: 20}}>{logEvent.title} at {logEvent.eventlocation}</Text>
                <Text></Text>
                <View style={{flexDirection:'row', alignContent: 'center', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text style={{paddingHorizontal: windowWidth/8}}>Select hours:</Text>
                    <Text style={{paddingHorizontal: windowWidth/8}}>Select minutes:</Text>
                </View>
                    <TimePicker
                        value={{ hours, minutes }}
                        onChange={(value)=>handleChange(value.hours, value.minutes)}
                        zeroPadding
                        minutesInterval={5}
                    />

                    { Platform.OS === 'ios' ? <View style={{alignContent:'center', alignItems:'center', justifyContent: 'center'}}>
                        <TouchableOpacity 
                            style={[styles.button, {backgroundColor: 'white', paddingBottom:10}]}
                            onPress={ ()=>{ createLog(); }}>
                            <Text style={{fontSize: 20, color: logo.blue, paddingVertical: 13, fontWeight: 'bold'}}>SAVE EVENT LOG</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.button, {backgroundColor: 'white'}]}
                            onPress={ ()=>{setLoggingModalVisible(false);}}>
                            <Text>CLOSE</Text>
                        </TouchableOpacity>
                    </View> : 
                    <View style={{flexDirection: 'row', paddingTop: 15}}>
                        <Button title='close' onPress={ ()=>{setLoggingModalVisible(false);}}/>
                        <View style={{paddingLeft: 10}} >
                            <Button title='Save Event Log' onPress={ ()=>{ createLog(); }}/>
                        </View>
                    </View>}
                </View>
                </View>
        </Modal>
        <View style={{flexDirection: 'row'}}> 
            <Text style={{fontSize: 25,}}>
            Pending Actions</Text>
            {arrlen ? <View style={styles.circle}><Text style={{fontSize: 15, color: 'white'}}>{arrlen}</Text></View>
            : <View></View>}
        </View>
            { !arrlen && <Text style={{fontSize: 16}}>You have 0 pending actions.</Text>}
        <ScrollView showsVerticalScrollIndicator={false}>
            {totalEvents.lenght && <Text>No pending event requests.</Text>}
            {totalEvents.map((item, index) => {
                var bannerStyle = {
                    title:'', color:'', checkButton: false, authorStr: 'me', iconTitle: 'event', editButton: true, buttonTitle: 'edit'}
                var isEventAuthor = false;
                // REPETITIVE CODE, please fix
                bannerStyle.title = `${item.title} at ${item.eventlocation}`;

                if (item.stat === 'pending') {
                    if (item.author === email) {
                        isEventAuthor = true;
                        bannerStyle.color = logo.blue;
                        bannerStyle.checkButton = false;
                        if (item.authorrole === "mentor") {
                            bannerStyle.authorStr = `${item.childfname}'s parent`;
                        } else if (item.authorrole === 'parent') {
                            bannerStyle.authorStr = `${item.childfname}'s mentor`;
                        } else {}
                    } else {
                        // bannerStyle.title = "New Event Request";
                        bannerStyle.checkButton = true;
                        bannerStyle.color = logo.red;
                    }
                } else if (item.stat === 'edited') {
                    bannerStyle.color = logo.yellow;
                    if (item.author === email) {
                        isEventAuthor = true;
                        bannerStyle.title = "You Sent A New Time Suggestion";
                        bannerStyle.checkButton = false;
                        if (item.authorrole === "mentor") {
                            bannerStyle.authorStr = `${item.childfname}'s parent`;
                        } else if (item.authorrole === 'parent') {
                            bannerStyle.authorStr = `${item.childfname}'s mentor`;
                        } else {}
                    } else {
                        bannerStyle.title = "New Time Suggestion";
                        bannerStyle.checkButton = true;
                    }
                } else if (item.stat === 'approved') {
                    bannerStyle.color = logo.blue;
                    bannerStyle.iconTitle = 'check';
                    bannerStyle.buttonTitle = 'close';
                    bannerStyle.editButton = false ;
                    bannerStyle.checkButton = true;
                    bannerStyle.title = "Did you complete this event?"
                } else if (item.stat === 'completed') {
                    return;
                } else {
                    // console.log(item.author + " | line 79")
                    return;
                }

                return <EventsActionRequiredCard key={index} setLoggingModalVisible={setLoggingModalVisible} setLogEvent={setLogEvent}
                    email={email} isEventAuthor={isEventAuthor} event={item} bannerStyle={bannerStyle}/>
            })}
        </ScrollView>    
    </View>
)}

export default EventsRequests;

const styles = StyleSheet.create({    
    container: {
      flex: 1,
      backgroundColor: '#F0F5FF',
    },

    header: { 
        padding: 10,
        backgroundColor: '#FF8D10'
    },
    modalView: {
        marginTop: 50,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        height: 900,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
      },

    card: {
        margin:10,
        marginTop: 10,
        backgroundColor: '#FFFFFF',
        padding: 5,
        height: deviceHeight/2.75,

        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#ddd',
        borderBottomWidth: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.20,
        shadowRadius: 10,
    
    },

    notifContainer: {
        // paddingTop:5,
        borderRadius: 5,
        backgroundColor: '#E6000C'
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
    event_container:{
        flex:1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        // alignContent: 'stretch',
        justifyContent: 'space-around',
        marginBottom: 100
    },

    circle: {
        backgroundColor: 'red',
        alignContent: 'center',
        justifyContent: 'center',
        marginLeft: 7,
        padding: 5,
        paddingHorizontal:11.5,
        borderRadius: 20
    },
    
  });
  