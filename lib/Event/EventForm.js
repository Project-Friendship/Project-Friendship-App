import React, { useState, useEffect } from 'react';
import { Dimensions, Button, View, StyleSheet, ScrollView, Modal, Alert, Platform, RecyclerViewBackedScrollView } from 'react-native';
import { Divider, Text, TextInput } from 'react-native-paper';
import { Icon } from '@rneui/themed'
import { TouchableOpacity } from 'react-native-gesture-handler';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getEIDByInfo } from '../GlobalFunctions/APICalls.js';
import { notify } from '../GlobalFunctions/PushNotify.js';

const CONFIG = require('../../config/app.config.js');
const handlePress = require('../GlobalFunctions/HandlePress') 
const APICalls = require('../GlobalFunctions/APICalls') 

function EventForm (props) {

    if(Platform.OS === 'android') { // only android needs polyfill
        require('intl'); // import intl object
        require('intl/locale-data/jsonp/en-US'); // load the required locale details
    }

    const {logo, formContentType} = CONFIG;

    const [eventTitle, setEventTitle] = useState("");
    const [eventDesc, setEventDesc] = useState("");
    const [eventLocation, setEventLocation] = useState("");
    
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('all');
    
    const [isPickerShow, setIsPickerShow] = useState(false);
    const [isPickerShowTime, setIsPickerShowTime] = useState(false);
    const [isPickerShowDate, setIsPickerShowDate] = useState(false);

    const [timePickerButtonText, setTimePickerButtonText] = useState('Select Time');

    const options = { weekday: 'short', hour: 'numeric', minute: 'numeric', month: 'long', day: 'numeric' };
    
    const {sid, date, setDate, 
        eventsArray, setEventsArray, 
        modalVisible, setModalVisible, 
        items, setItems} = props;

    const showPicker = () => {
        setIsPickerShow(!isPickerShow);
        if(isPickerShow) {
            setTimePickerButtonText('Select Time');
        } else {
            setTimePickerButtonText('Close Time Picker');
        }
    };

    const onChange = (event, value) => {
        if (value) { 
            if (Platform.OS === 'android') {
                setIsPickerShow(false);
                // set date or time...
                // console.log(value)
                console.log(date)
                
                // console.log(newDate);
            } else if(Platform.OS === 'ios') { //IOS
                setDate(value);
            } else {
                return Alert.alert("OS Not Recognized", "This app can only be used on iOS or Android platforms for best compatibility.")
            }
        } else { return; }
    };

    const onChangeTime = (event, value) => {
        if (value) {
            // if time !== undefined
            // return console.log("TYpe: " + new Datevalue/);
            var newDate = date;
            // var givenTime = new Date(value);
            newDate.setTime(value.getTime());
            var utc = new Date(newDate.getTime() + newDate.getTimezoneOffset() * 60000);
            setDate(newDate);
        }

        return setIsPickerShowTime(false);
    }

    const onChangeDate = (event, value) => {
        if (value) {
            // return console.log(value);
            var newDate = date;
            newDate.setDate(value.getDate());
            newDate.setMonth(value.getMonth());
            newDate.setYear(value.getUTCFullYear());
            var utc = new Date(newDate.getTime() + newDate.getTimezoneOffset() * 60000);
            setDate(newDate);
        }

        return setIsPickerShowDate(false);
    }

    const sendEvent = async () => {
        // sends event to the db
        setModalVisible(false);
        
        var { email } = await handlePress('sessions', 'PUT', {
            headers: {"Content-type": formContentType}, body: `sid=${sid}&`});

        var user = await handlePress('users', 'PUT', {
            headers: {"Content-type": formContentType}, body: `email=${email}&`});
        
        if(user.role === 'parent') {
            // is parent, recipient is mentor
            var mentor = await handlePress('childrs/findMentorEmail', 'PUT', {
                headers: {"Content-type": formContentType}, body: `cid=${value}&`});
            // notify mentor:
            await notify(mentor[0].email, "New Event Request", `${eventTitle} at ${eventLocation}.`) 
        } else if (user.role === 'mentor') {
            // recipient of event is all parents
            var parents = await handlePress('childrs/findParentEmail', 'PUT', {
                headers: {"Content-type": formContentType}, body: `cid=${value}&`});
            // notify all parents
            for (let parent = 0; parent < parents.length; parent++) {
                let parentEmail = parents[parent].email;
                await notify(parentEmail, "New Event Request", `${eventTitle} at ${eventLocation}.`)
            }
        } else { }
        
        await handlePress('events', 'POST', { 
            headers: {"Content-type": formContentType},
            body: `author=${email}&cid=${value}&title=${eventTitle}&stat=${'pending'}&descrip=${eventDesc}&eventDate=${date}&eventCreated=${new Date(Date.now())}&eventLocation=${eventLocation}&approvedBy=${'null'}`});  
        
        // const event = handlePress('events', 'PUT', {
        //     headers: {"Content-type": formContentType},
        //     body:`email=${email}`,
        // });

        const eventEID = await getEIDByInfo(value, eventDesc, eventLocation);

        setEventsArray([{
            eid: eventEID,
            author : email,
            cid: value,
            stat : "pending",
            title : eventTitle,
            descrip : eventDesc,
            eventdate : date,
            eventcreated : new Date(Date.now()),
            eventlocation: eventLocation,
            approvedby: 'null',
            justcreated: true,
        }, ...eventsArray])
        
        // console.log("Sending Event...")
        // // reset values
        setEventTitle(''); setEventDesc(''); setValue(null); setDate(new Date(Date.now())); setEventLocation('');
        alert("Event Created!","Your created event was shared!");
    }
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setModalVisible(!modalVisible); }}>

            <View style={styles.centeredView}>
            <View style={styles.modalView}>
                <Text style={{fontSize: 30, paddingBottom: 10,
                    fontWeight: 'bold', color: logo.blue, marginTop: 10}}>CREATE EVENT</Text>
                
                <TextInput style={styles.input} 
                    mode="outlined"
                    label="Title*"
                    activeOutlineColor={logo.blue}
                    value={eventTitle}
                    onChangeText={eventTitle => setEventTitle(eventTitle)}
                    />

                <TextInput style={styles.input} 
                    mode="outlined"
                    label="Description*"
                    activeOutlineColor={logo.blue}
                    value={eventDesc}
                    onChangeText={eventDesc => setEventDesc(eventDesc)}
                    />

                <DropDownPicker
                    text="Select audience"
                    style={{marginVertical:4, backgroundColor:'#f3f3f3', borderColor: 'grey', }}
                    open={open}
                    value={value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}/> 

                <TextInput style={styles.input} 
                    mode="outlined"
                    label="Location*"
                    activeOutlineColor={logo.blue}
                    value={eventLocation}
                    onChangeText={(eventLocation)=>{setEventLocation(eventLocation)}}
                    />

                {/* DATE AND TIME PICKER HERE */}

                <View style={{paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between'}}>
                    { Platform.OS === 'ios' ? <Text style={styles.pickedDate}>{date.toLocaleString('en-US', options)}</Text> : 
                    <Text style={styles.pickedDate}>{Intl.DateTimeFormat('en-US', options).format(date)}</Text>}
                </View>
                {Platform.OS === 'ios'?  <Button title={timePickerButtonText} color="purple" onPress={showPicker} />  
                    : <View></View>}

                { Platform.OS === 'android' ? <View style={{flexDirection: 'row', padding: 10}}>
                    <View style={{paddingRight: 10}}>
                        <Button title={'Select Date'} color="purple" onPress={()=>setIsPickerShowDate(true)} /> 
                    </View>
                    <Button title={'Select Time'} color="purple" onPress={()=>setIsPickerShowTime(true)} /> 
                </View> : <View></View>}

                {/* The date pickers */}
                    {/* Android time picker */}
                {Platform.OS === 'android'? isPickerShowTime && (
                <DateTimePicker
                    value={date}
                    mode={'time'}
                    display={'default'}
                    is24Hour={true}
                    onChange={onChangeTime}
                    style={styles.datePicker}
                />) : <View></View>}
                
                {Platform.OS === 'android'? isPickerShowDate && (
                <DateTimePicker
                    value={date}
                    mode={'date'}
                    display={'default'}
                    is24Hour={true}
                    onChange={onChangeDate}
                    style={styles.datePicker}
                />) : <View></View>}

                {Platform.OS === 'ios'? isPickerShow && (
                <DateTimePicker
                    value={date}
                    mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    is24Hour={true}
                    onChange={onChange}
                    style={styles.datePicker}
                />) : <View></View>}

                {/* The button that used to trigger the date picker */}
                                
                <View style={{flexDirection: 'row', justifyContent:'space-between', padding: 10}}>
                    <View style={{paddingRight: 20}}>
                        <Button title='SEND EVENT REQUEST' style={{margin:10}} onPress={()=> {sendEvent();}}/> 
                    </View>
                    <Button title="close" onPress={()=>setModalVisible(false)}/>
                </View>
            </View>
            </View>
      </Modal>
    );
}

export default EventForm;

const styles = StyleSheet.create({
    pickedDate: {
        paddingTop: 7,
        fontSize: 20,
        color: 'black',
    },
      // This only works on iOS
    datePicker: {
        width: 320,
        height: 260,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
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

    button: {
        alignItems: "center",
        backgroundColor: "#00ABEB",
        padding: 10
    },
    
    container: {
      flex: 1,
      backgroundColor: '#F0F5FF',
    },
    input: {
        height: 50,
        width: '100%',
        marginBottom: 5,
        padding: 0,
      },    
  });