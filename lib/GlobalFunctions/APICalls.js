const CONFIG = require('../../config/app.config.js');
const handlePress = require('../GlobalFunctions/HandlePress'); 
const formContentType = CONFIG.formContentType;


/**
 * GET API calls
 */

export const getEventSummaryByCID = async (cid)  => {
    return await handlePress('events/cid', 'PUT', {
        headers: {"Content-type": formContentType}, body: `cid=${cid}`});
}

export const getNotifTokenByEmail = async (email)  => {
    return await handlePress('sessions/getToken', 'PUT', {
        headers: {"Content-type": formContentType}, body: `email=${email}`});
}

export const getEmailFromSessionID = async (sid) => {
    const { email } = await handlePress('sessions', 'PUT', {
        headers: {"Content-type": formContentType}, body: `sid=${sid}&`}); 
    return email;
}

export const getUserProfile = async (email) => {
    return await handlePress('users', 'PUT', {
        headers: {"Content-type": formContentType}, body: `email=${email}&`});
}

export const getRelationsByEmail = async (email) => {
    return await handlePress('childrs', 'PUT', {
        headers: {"Content-type": formContentType}, body: `email=${email}&`});
}

export const getChildProfileByChildID = async (cid) => {
    return await handlePress('child', 'PUT', { 
        headers: {"Content-type": formContentType}, body: `cid=${cid}&`});
}

export const getChildProfileByLnameDOB = async (lname, dob) => {
    return await handlePress('child/dobSearch', 'PUT', {
        headers: {"Content-type": formContentType}, 
        body: `lname=${lname}&dob=${dob}`});
}

export const getChildMentorEmailByChildID = async (cid) => {
    return await handlePress('childrs/findMentorEmail', 'PUT', {
    headers: {"Content-type": formContentType}, body: `cid=${cid}&`});
}

export const getChildParentEmailByChildID = async (cid) => {
    return await handlePress('childrs/findParentEmail', 'PUT', {
        headers: {"Content-type": formContentType}, body: `cid=${cid}&`});
}

/**
 * GET API calls for EVENTS
 */
export const getPendingEventsByChildID = async (cid) => {
    return await handlePress('events/pending', 'PUT', { 
        headers: {"Content-type": formContentType}, body: `cid=${cid}&`});
}

export const getApprovedEventsByChildID = async (cid) => {
    return await handlePress('events/approved', 'PUT', { 
        headers: {"Content-type": formContentType}, body: `cid=${cid}&`});
}

export const getEIDByInfo = async (cid, descrip, eventLocation) => {
    const {eid} = await handlePress('events/geteid', 'PUT', { 
        headers: {"Content-type": formContentType}, 
        body: `cid=${cid}&descrip=${descrip}&eventLocation=${eventLocation}`});
    return eid;
}


export const getEventsByEmail = async (email) => {
    return await handlePress('events', 'PUT', { 
        headers: {"Content-type": formContentType}, body: `email=${email}&`});
        
}

export const getLogsByEmail = async (email) => {
    return await handlePress('log', 'PUT', { 
        headers: {"Content-type": formContentType}, body: `email=${email}&`});
}

/**
 * POST API calls
 */

export const createChild = async (fname, lname, dob, school, pronouns, notes) => {
    return await handlePress('child', 'POST', {
        headers: {"Content-type": formContentType}, 
        body: `fname=${fname}&lname=${lname}&dob=${dob}&school=${school}&pronouns=${proouns}&notes=${notes}`});
}

export const createRelationship = async (cid, email, isparent) => {
    return await handlePress('childrs', 'POST', {
        headers: {"Content-type": formContentType}, 
        body: `cid=${cid}&email=${email}&isParent=${isparent}`});
}

export const createEvent = async (email, cid, title, stat, descrip, date, eventCreated, eventLocation, approvedBy ) => {
    return await handlePress('events', 'POST', { // posts new event with given parameters 
        headers: {"Content-type": formContentType},
        body: `author=${email}&cid=${cid}&title=${title}&stat=${stat}&descrip=${descrip}&eventDate=${date}&eventCreated=${eventCreated}&eventLocation=${eventLocation}&approvedBy=${approvedBy}`});  
}

export const createEventLog = async (eid, email, duration) => {
    return await handlePress('log', 'POST', { // posts new event log with given parameters 
        headers: {"Content-type": formContentType},
        body: `eid=${eid}&email=${email}&duration=${duration}`});  
}

export const createUserProfile = async (email, first, last, role, phone, pnouns) => {
    return await handlePress('users', 'POST', {  
        headers: {"Content-type": formContentType}, 
        body: `email=${email}&fname=${first}&lname=${last}&role=${role}&phone=${phone}&pronouns=${pnouns}`});
}

export const createRegistrationRequest = async (first, last, email, phone, role, pronouns) => {
    return await handlePress('register', 'POST', { // adds into votes. 
        headers: {"Content-type": formContentType}, 
        body: `fname=${first}&lname=${last}&email=${email.toLowerCase()}&phone=${phone}&role=${role}&pronouns=${pronouns}`});
}

/**
 * DELETE API calls
 */

export const deleteUserProfile = async (email) => {
    return await handlePress('users', 'DELETE', {  
        headers: {"Content-type": formContentType}, 
        body: `email=${email}`});
}

export const deleteEventByEID = async (eid) => {
    return await handlePress('events', 'DELETE', { // deletes previous event 
        headers: {"Content-type": formContentType},
        body: `eid=${eid}`});
}

export const deleteRegistrationRequest = async (email) => {
    return await handlePress('register', 'DELETE', { // deletes user from registratoin 
        headers: {"Content-type": formContentType}, 
        body: `email=${email}`});
}

export const deleteSessionID = async (sid, email) => {
    return await handlePress('sessions', 'DELETE', {  
        headers: {"Content-type": formContentType}, body: `sid=${sid}&email=${email}`});
}

// export const getEventsByChildID = async (cid) => {
//     return await handlePress('events/approved', 'PUT', { 
//         headers: {"Content-type": formContentType}, body: `cid=${cid}&`});
        
// }


/**
 * UPDATE API Calls
 */

 export const updateUserProfile = async (e, mail, first, last, value, pnum, pnouns) => {
    await deleteUserProfile(e);
    return await createUserProfile(mail, first, last, value, pnum, pnouns);
}

export const updateRegistrationRequest = async (e, mail, first, last, value, pnum, pnouns) => {
    await deleteRegistrationRequest(e);
    await createRegistrationRequest(first, last, mail, pnum, value, pnouns);
}

export const completeEvent = async (event) => {
    const { eid, author, cid, title, descrip, eventdate, eventcreated, 
    eventlocation, approvedby } = event;
    let stat = 'completed'
    await createEvent(author, cid, title, stat, descrip, eventdate, eventcreated, 
        eventlocation, approvedby);
}