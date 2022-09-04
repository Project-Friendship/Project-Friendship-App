-- There are 2 relationship tables, I will delete the other one
-- and primarily use this one. I like the structure of this better

drop table childrelationship;

create table childrelationship (
    rid serial primary key,
    cid int,
    email text,
    isParent boolean
);
