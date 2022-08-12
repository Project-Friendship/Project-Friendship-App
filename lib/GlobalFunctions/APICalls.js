const CONFIG = require('../../config/app.config.js');
const handlePress = require('../GlobalFunctions/HandlePress'); 
const formContentType = CONFIG.formContentType;


/**
 * GET API calls
 */
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

export const createEvent = async (email, cid, title, stat, descrip, date, eventCreated, eventLocation ) => {
    return await handlePress('events', 'POST', { // posts new event with given parameters 
        headers: {"Content-type": formContentType},
        body: `author=${email}&cid=${cid}&title=${title}&stat=${stat}&descrip=${descrip}&eventDate=${date}&eventCreated=${eventCreated}&eventLocation=${eventLocation}`});  
}

/**
 * DELETE API calls
 */

export const deleteEventByEID = async (eid) => {
    return await handlePress('events', 'DELETE', { // deletes previous event 
        headers: {"Content-type": formContentType},
        body: `eid=${eid}`});
}


// export const getEventsByChildID = async (cid) => {
//     return await handlePress('events/approved', 'PUT', { 
//         headers: {"Content-type": formContentType}, body: `cid=${cid}&`});
        
// }