-- creates table for profiles
-- if login does not exists, email is set to  

create table users (
    email text primary key,
    fname text,
    lname text,
    role text,
    phone text,
    pronouns text
);

-- important inserts to begin:
INSERT INTO users (email, fname, lname, role, phone, pronouns) VALUES ('null', '', '', '', '', '', '');
INSERT INTO users (email, fname, lname, role, phone, pronouns) VALUES ('kahnareeba@gmail.com', 'Areeba', 'Khan', 'admin', '314-745-9208', 'She/her/hers');

-- example insert
-- INSERT INTO users (email, fname, lname, role, phone) VALUES ('khan6@stolaf.edu', 'Areeba', 'Khan', 'mentor', '123-456-7890', 'She/her/hers');

-- Adding pronouns for parents and users 
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS pronouns text;


-- table of users that have requested to sign up

drop table registerRequests;

create table registerRequests (
    email text primary key,
    fname text,
    lname text,
    role text,
    phone text,
    pronouns text,
    daterequested text
);

-- create table approvedEmails (
--     email text primary key,
--     role text
-- );

drop table sessions;

create table sessions (
    sid text primary key, -- secure session key
    email text,            -- authenticated email 
    notiftoken text
);

create function email(text) returns text as $$
    select email from sessions where sid = $1;
$$ language 'sql';

-- -- postgres function update_profile()
-- --    3 args type text: email, fname, lname, role, phone
-- --    no return
-- create function approveUserRegistration(text, text, text, text, text) returns void as $$
--     DELETE FROM registerrequests WHERE email = $1;
--     INSERT INTO users VALUES ($1, $2, $3, $4, $5);
-- $$ language 'sql';


