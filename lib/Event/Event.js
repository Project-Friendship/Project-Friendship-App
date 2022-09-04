import React, { useState, useEffect } from 'react';
import { Dimensions, Button, View, StyleSheet, ScrollView, Modal, Alert } from 'react-native';
import { Divider, Text, TextInput } from 'react-native-paper';
import { Icon } from '@rneui/themed'
import { TouchableOpacity } from 'react-native-gesture-handler';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import PastEventCard from './PastEventCard'
import EventForm from './EventForm';
import EventEditingForm from './EventEditingForm';
import EventsActionRequired from './EventsActionRequired';
import EventsUpcomingCard from './EventsUpcomingCard';
// import EventsUpcomingCard from './EventsUpcomingCard';

const CONFIG = require('../../config/app.config.js');
const handlePress = require('../GlobalFunctions/HandlePress') 
const APICalls = require('../GlobalFunctions/APICalls') 

const {width: windowWidth} = Dimensions.get('window');

const Event = (props) => {

    const { formContentType, logo } = CONFIG;
    const { sid, role } = props.route.params;
    console.log("  role: " + role)

    const [notification, setNotification] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
 
    const [email, setEmail] = useState('');

    const [items, setItems] = useState([]);
    const [date, setDate] = useState(new Date(Date.now()));

    const [eventsArray, setEventsArray] = useState([]);
    const [upcomingEventsArray, setUpcomingEventsArray] = useState([]);


    const pushRSToArray = (arr, l, p) => {
        arr.push({
          label: l,
          value: p,
        })
      } 

    const [approvedAndPastEvents, setApprovedAndPastEvents] = useState([]);

    const getAllEvents = async ( cid, email ) => {
        let childEvents = await APICalls.getEventSummaryByCID(cid);
        let pendingEvents = [];
        let approvedEvents = [];
        let completedEvents = [];
        let archivedEvents = [];
        let eventsNeedLogging = [];
        // console.log(role)

        // if event date passed, and is not equal to completed
        const date = new Date();
        // console.log("DATE:"+date)
    
        for (let i = 0; i < childEvents.length; i++) {
            let current = childEvents[i];
            // if event date passed: and is not equal to complete
            const eventdate = new Date(current.eventdate);
            eventdate.setHours(eventdate.getHours()+1);

            if (date > eventdate) {
                if (current.stat === 'approved') {
                    eventsNeedLogging.push(current);
                } else {
                    // archive event and possible delete it 
                    archivedEvents.push(current);
                }
                continue;
            }

            switch (current.stat) {
                case "pending": 
                    pendingEvents.push(current);
                    break;
                case "edited": 
                    pendingEvents.push(current);
                    break;
                case "approved":
                    if(email === current.author) { current.contact = current.approverphone } 
                    else { current.contact = current.authorphone }
                    approvedEvents.push(current);
                    break;
                case "completed":
                    completedEvents.push(current);
                    break;
                default:
                    break;
            }
        }

        console.log("pending length: " + pendingEvents.length);
        setEventsArray(pendingEvents);
        setUpcomingEventsArray(approvedEvents);
        if (role === 'mentor') {
            setApprovedAndPastEvents(eventsNeedLogging);
        }

    }

    const setDropDownItems = async (email, role, relations) => {
        var arr = [];

        for (let i = 0; i < relations.length; i++) {     
            let { cid } = relations[i];
            // updatePendingEvents(cid, email);
            // updateUpcomingEvents(cid, email);
            getAllEvents(cid, email);
            
            let mentor = await APICalls.getChildMentorEmailByChildID(cid);
            let child = await APICalls.getChildProfileByChildID(cid);

            if (mentor.length) { // if mentor exists
                let mentorEmail = mentor[0].email;
                let user = await APICalls.getUserProfile(mentorEmail);
                let givenLabel = '';
                if(role==='parent') {
                    givenLabel = `${user.fname} (${child.fname}'s mentor)`;
                } else if(role==='mentor') {
                    givenLabel = `${child.fname} ${child.lname[0]}.`;
                } else {}
                pushRSToArray(arr, givenLabel, cid);
            } else {
                console.log("This child is not paired with a mentor.")
            }
        }
    
        setItems(arr);
    }

    const fetchInfo = async () => {
        const email = await APICalls.getEmailFromSessionID(sid);
        setEmail(email);

        // var { role } = await APICalls.getUserProfile(email);
        // setRole(role);

        var relations = await APICalls.getRelationsByEmail(email);
        await setDropDownItems(email, role, relations);
    } 

    useEffect( async () => {
        fetchInfo();
    }, []);

  
return ( <View style={styles.container}>
    <EventForm modalVisible={modalVisible} setModalVisible={setModalVisible} 
        eventsArray={eventsArray} setEventsArray={setEventsArray} 
        setItems={setItems} items={items}
        setDate={setDate} date={date} sid={sid}/>

    <View style={[styles.header, {flex: 1.5, flexDirection: 'row', justifyContent: 'space-between'}]}>
        <View style={{flexDirection: 'row'}}> 
        <Icon name='event' color='white' size={58}/>
        <Text style={{fontSize: 45, color: 'white'}}>
        EVENTS</Text></View>
        <TouchableOpacity
            style={{backgroundColor: 'white', height: 55, width: 75, 
            alignContent: 'center', paddingTop: 4}}
            onPress={()=>{
                setDate(new Date(Date.now()));
                setModalVisible(true)
                }}>
            <Icon name='edit' color={logo.yellow} size={30}/>
            <Text style={{textAlign: 'center',}}>CREATE</Text>
        </TouchableOpacity>
    </View>
    <View style={{flex:16.5}}>
        <EventsActionRequired fetchInfo={fetchInfo} approvedAndPastEvents={approvedAndPastEvents}
            email={email} role={role} eventsArray={eventsArray} arrlen={eventsArray.length + approvedAndPastEvents.length}/>

        <View style={[styles.card, {marginBottom: 18, flex:20}]}> 
            <View style={{flexDirection: 'row'}}> 
                <Text style={{fontSize: 25,}}>
                Upcoming Events</Text>
                {false && <View style={styles.circle}><Text style={{fontSize: 15, color: 'white'}}>2</Text></View>}
            </View>
                { !upcomingEventsArray.length && <Text style={{fontSize: 16}}>You have 0 upcoming events.</Text>}
            <ScrollView>
                { upcomingEventsArray.map ((item, index) => {
                    return (<EventsUpcomingCard key={index} event={item}/>);
                })}
            </ScrollView>    
        </View>
    </View>

    
    
    <View style={styles.navigation_bar}>
        <TouchableOpacity onPress={()=> console.log("Pressed Chat")}>
            <Icon name='chat' size={50} color='white'/>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> {            
            return props.navigation.navigate('Event', { sid, role });}}>
            <Icon name='event' size={50} color='white'/>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> {
            return props.navigation.navigate('Home', { sid, role });}}>
            <Icon name='home' size={50} color='white'/>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> {
            return props.navigation.navigate('AlertForm', { sid, role });}}>
            <Icon name='warning' size={50} color='white'/>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> {
            return props.navigation.navigate('Profile', { sid, role });}}>
            <Icon name='face' size={50} color='white'/>
        </TouchableOpacity>
    </View>
  </View>)
};

export default Event;

const styles = StyleSheet.create({    
    container: {
      flex: 1,
      backgroundColor: '#F0F5FF',
    },

    header: { 
        flex: 3,
        padding: 10,
        backgroundColor: '#FF8D10'
    },

    card: {
        margin:10,
        marginTop: 10,
        backgroundColor: '#FFFFFF',
        padding: 5,
        height: 405,

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
        paddingHorizontal:10,
        borderRadius: 20
    },

    navigation_bar: {
        flex: 1.5,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',

        backgroundColor: '#FF8D10',
        height: 20,
        width: '100%'
    }   
    
  });