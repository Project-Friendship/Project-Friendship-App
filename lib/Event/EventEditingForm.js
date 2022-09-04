import React, { useState, useEffect } from 'react';
import { Dimensions, Button, View, StyleSheet, ScrollView, Modal, Alert } from 'react-native';
import { Divider, Text, TextInput } from 'react-native-paper';
import { Icon } from '@rneui/themed'
import { TouchableOpacity } from 'react-native-gesture-handler';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

const CONFIG = require('../../config/app.config.js');
const APICalls = require('../GlobalFunctions/APICalls');

function EventForm (props) {
    if(Platform.OS === 'android') { // only android needs polyfill
        require('intl'); // import intl object
        require('intl/locale-data/jsonp/en-US'); // load the required locale details
    }

    const formContentType = CONFIG.formContentType;

    const [isPickerShow, setIsPickerShow] = useState(false);
    const [isPickerShowTime, setIsPickerShowTime] = useState(false);
    const [isPickerShowDate, setIsPickerShowDate] = useState(false);

    const [timePickerButtonText, setTimePickerButtonText] = useState('Select Time');

    const options = { weekday: 'short', hour: 'numeric', minute: 'numeric', month: 'long', day: 'numeric' };
    
    const {sid, event, email, setConfirmed, setDateOnCard,
        eventEditingFormModalVisible, setEventEditingFormModalVisible, 
        } = props;

        
    const dateFormat = new Date(event.eventdate);
    const [value, setValue] = useState(dateFormat);
    const [date, setDate] = useState(dateFormat)
    

    const showPicker = () => {
        setIsPickerShow(!isPickerShow);
        if(isPickerShow) {
            setTimePickerButtonText('Select Time');
        } else {
            setTimePickerButtonText('Close Time Picker');
        }
    };

    const onChange = (event, value) => {
        setDate(value);
        if (Platform.OS === 'android') {
        setIsPickerShow(false);
        }
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
        setConfirmed(true);
        // console.log("Sending Event...")
        setEventEditingFormModalVisible(false);
        await APICalls.deleteEventByEID(event.eid);
        
        let eventcreated = new Date(Date.now());
        await APICalls.createEvent(email, event.cid, event.title, 'edited', 
        event.descrip, date, eventcreated, event.eventlocation, null);
        setDateOnCard(date);
        
        alert("Event Edited!","Your event time edit was shared!");
        // fetchInfo();
    }
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={eventEditingFormModalVisible}
            onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setEventEditingFormModalVisible(!eventEditingFormModalVisible); }}>

            <View style={styles.centeredView}>
            <View style={styles.modalView}>
                <Text style={{fontSize: 30, paddingBottom: 10,
                    fontWeight: 'bold', color: CONFIG.logo.blue, marginTop: 10}}>Edit Event Time</Text>
                
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
                                
                { Platform.OS === 'ios' ? 
                <View>
                    <TouchableOpacity
                        style={[styles.button, {marginTop: 30}]}
                        onPress={()=> {sendEvent();}}>
                        <Text style={{fontWeight:'bold', color:'white'}}>Send Time Change Request</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.button, {backgroundColor: 'white'}]}
                        onPress={
                            ()=>{setEventEditingFormModalVisible(false);
                            setDate(dateFormat);}}>
                        <Text>CLOSE</Text>
                    </TouchableOpacity> 
                </View> 
                : 
                <View style={{flexDirection: 'row', paddingTop: 25}}>
                    <Button title='Close' style={{marginRight: 10}} onPress={
                            ()=>{setEventEditingFormModalVisible(false);
                            setDate(dateFormat);}}/>
                    <View style ={{paddingLeft: 15}}>
                        <Button title='Submit Time Change' onPress={()=> {sendEvent();}}  />
                    </View>
                </View> }
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
  