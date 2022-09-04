-- creates a view so I don't have to query for everything from other tables

drop view childrs_summary;

create view events_summary as
    select e.*, c.fname as childfname, c.lname as childlname, 
    u.fname as authorfname, u.lname as authorlname, u.role as authorrole, u.phone as authorphone, 
    u2.fname as approverfname, u2.lname as approverlname, u2.role as approverrole, u2.phone as approverphone
    from events e, users u, users u2, child c
    where e.author = u.email and e.cid = c.cid and e.approvedby = u2.email;
