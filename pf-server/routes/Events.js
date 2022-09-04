const express = require('express');
const router = express.Router();

const pool = require('./index');

router.post('/', (request, response) => {
    let { author, cid, title,
		descrip, stat, eventDate, 
		eventCreated, eventLocation, approvedBy} = request.body;

	console.log(`Got request to add an event, 
			will add ${title} created by ${author} to database`);
    pool.query(
	'INSERT INTO events (author, cid, title, stat, descrip, eventDate, eventCreated, eventLocation, approvedBy) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
	       [author, cid, title, stat, descrip, eventDate, eventCreated, eventLocation, approvedBy])
	.then(res => {
	    console.log('DB response: ' + res.rows[0]);
	    response.sendStatus(200)
	})
	.catch(err =>
	       setImmediate(() => {
		   throw err;
	       }));
})

router.put('/', (request, response) => {
    console.log(`Got request to get events of given email`);
	let email = request.body.email;
	console.log("Check for cid: " + cid)
    pool.query('SELECT * FROM events where author = ($1)', [email])
	.then(res => {
	    console.log('DB response: ' + JSON.stringify(res.rows[0]));
	    response.send(res.rows[0]);
	}).catch(err =>
	       setImmediate(() => {
		   throw err;
	       }));
})

router.put('/eid', (request, response) => {
    console.log(`Got request to get events of given all event information`);
	let { author, cid, title,
		descrip, stat, eventDate, eventCreated, eventLocation} = request.body;
	console.log("Check for cid: " + cid)
    pool.query('SELECT eid FROM events where author = $1 cid = $2 eventDate = $3 eventCreated = $4 eventLocation = $5', 
	[author, cid, eventDate, eventCreated, eventLocation])
	.then(res => {
	    console.log('DB response: ' + JSON.stringify(res.rows[0]));
	    response.send(res.rows[0]);
	}).catch(err =>
	       setImmediate(() => {
		   throw err;
	       }));
})

router.put('/geteid', (request, response) => {
    console.log(`Got request to get events of given all event information`);
	let { cid, descrip, eventLocation} = request.body;
	console.log("Get EID when given cid")
    pool.query('SELECT eid FROM events where cid = $1 AND descrip = $2 AND eventlocation = $3', 
	[cid, descrip, eventLocation])
	.then(res => {
	    console.log('DB response: ' + JSON.stringify(res.rows[0]));
	    response.send(res.rows[0]);
	}).catch(err =>
	       setImmediate(() => {
		   throw err;
	       }));
})


router.put('/pending', (request, response) => {
    let cid = request.body.cid.toString();
	let stat = 'approved';
	let stat2 = 'completed';
	
	console.log("Return unapproved events for given cid: " + cid)
    pool.query('SELECT * from events WHERE cid = $1 and stat != $2 and stat != $3', [cid, stat, stat2])
	.then(res => {
	    console.log('DB response: ' + JSON.stringify(res.rows));
	    response.send(res.rows);
	})
	.catch(err =>
	       setImmediate(() => {
		   throw err;
	       }));
})

router.put('/approved', (request, response) => {
    let cid = request.body.cid.toString();
	let stat = 'approved';
	
	console.log("Return approved events for given cid: " + cid)
    pool.query('SELECT * from events WHERE cid = $1 and stat = $2', [cid, stat])
	.then(res => {
	    console.log('DB response: ' + JSON.stringify(res.rows));
	    response.send(res.rows);
	})
	.catch(err =>
	       setImmediate(() => {
		   throw err;
	       }));
})

router.delete('/', (request, response) => {
    let eid = request.body.eid;
    console.log(`Got request to delete event under eid: ${eid}
     from EVENTS table if exists`);
    pool.query('DELETE FROM events WHERE eid = $1', [eid])
	.then(res => {
	    console.log('DB response: ' + res.rows[0]);
	    response.sendStatus(200)
	})
	.catch(err =>
	       setImmediate(() => {
		   throw err;
	       }));
})

/**
 * @swagger  
 * /events:
 *  get:
 *    description: returns all events for child
 *    responses:
 *      '200':
 *        description: all child events returned
 */
router.put('/cid', (request, response) => {
    let { cid } = request.body;
	
	console.log("Return all events for given cid: " + cid)
    pool.query('SELECT * from events_summary WHERE cid = $1', [cid])
	.then(res => {
	    console.log('DB response: ' + JSON.stringify(res.rows));
	    response.send(res.rows);
	})
	.catch(err =>
	       setImmediate(() => {
		   throw err;
	       }));
})


module.exports = router;
