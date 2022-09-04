-- set up relationship table
-- pending, approved, expired/completed/removed

drop table events;

create table events (
    eid serial primary key,
    author text,
    cid int,
    stat text default 'pending',
    title text,
    descrip text,
    eventDate text,
    eventCreated text,
    eventLocation text,
    approvedBy text default 'null'
);

-- stat:
---- pending: event created and is pending approval
---- edited: event time was edited by a user and request was resent for event
---- completed: event was completed and logged
---- expired: event request was not approved before the time expired...

drop table log;

create table log (
    lid serial primary key,
    eid int,
    mentorEmail text,
    duration numeric
);


-- INSERT INTO events (author, participant, stat, title, descrip, eventDate) VALUES;

-- Added a column for eventLocation
-- ALTER TABLE events  ADD COLUMN IF NOT EXISTS eventLocation text
-- ALTER TABLE events RENAME COLUMN author TO mentor;
-- ALTER TABLE events RENAME COLUMN participant TO cid;

-- create table eventChangeRequests (
--     eid text, 
--     creator text,
--     reciever text,
--     status text default 'pending' -- pending, approved
    
-- ); 

