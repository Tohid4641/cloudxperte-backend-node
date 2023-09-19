const db = require('../db');

const saveHiringDetails = async (user_data) => {
    console.log('inside model function');

    let user_name = user_data.name;
    let user_email = user_data.email;
    let user_contact = user_data.phone;
    let user_message = user_data.comments;
    let total_weeks = user_data.total_weeks;
    let total_hrs = user_data.total_hrs
    let total_cost = user_data.total_cost;
    let total_cost_per_week = user_data.total_cost_per_week;

    var sqlquery = 'INSERT INTO hiring_users (user_name, user_email, user_contact, user_message, total_weeks, total_hours, cost_per_week, final_total ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    var params = [user_name, user_email, user_contact, user_message, total_weeks, total_hrs, total_cost_per_week, total_cost];
    var rows = await db.dbQuery(sqlquery, params);
    console.log(rows);
    if (rows.affectedRows == 1) {
        return { status: true, user_id: rows.insertId };
    } else {
        return { status: false };
    }
}
const saveAllHiringDetails = async (user_id, hiring_data) => {
    console.log('called for saveAllHiringDetails');
    let job_listing = hiring_data.requestResources;
    console.log(hiring_data.requestResources);
    // let user_id = 2;
    
    var rows = await db.dbQuery(`insert into hiring_details (user_id, skill, job_title, start_date, end_date, cost_per_hour, resource_hours, resource_cost) values ?`,  [ job_listing.map(job => [user_id, job.Skill, job.JobTitle, job.resourceStartDate, job.resourceEndDate, job.cost_per_hrs, job.resource_hrs, job.resource_total_cost])],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                
            }

            console.log("success: ", res);
            
        }
 
    );
    console.log(rows);

}


module.exports = {
    saveHiringDetails,
    saveAllHiringDetails
}
/*
const { submitRequest, getResponse } = require('../controller/hire_app_controller')


hire_app_route.post('/submitRequest',submitRequest)
hire_app_route.post('/getResponse',getResponse)

module.exports = hire_app_route*/