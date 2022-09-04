-- creates a view so I don't have to query for everything from other tables
-- work in progress...

drop view childrs_summary;

create view childrs_summary as
    select rs.*, c.fname as childfname, c.lname as childlname, 
    u.fname as authorfname, u.lname as authorlname, u.role as authorrole, u.phone as authorphone, 
    from childrelationship rs, users u, child c
    where e.author = u.email and e.cid = c.cid and e.approvedby = u2.email;
