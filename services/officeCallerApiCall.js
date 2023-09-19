const request = require("request");

exports.officeCallerApiCall = async (name,email,phone,comments,city,country,currency,currency_flag,category,platform,feature,request_from,cost,leadInfoArr) => {

    // Current Date
    // const currentDate = new Date();
    // const day = String(currentDate.getDate()).padStart(2, '0');
    // const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    // const year = currentDate.getFullYear();
    // const formattedDate = `${day}/${month}/${year}`;   // eg: 22/06/2023

    let current_date = new Date().toJSON().slice(0,10);  
    let today = new Date(); 
    let current_time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let current_date_for_enq = current_date+' '+current_time;


    var options = {
        'method': 'POST',
        'url': 'https://admin.officecaller.com/api/leads/website_lead/',
        'headers': {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            "title": name || "",
            "first_name": name || "",
            "email": email || "",
            "phone": phone || 9999999999,
            "city": `${city}, ${country}` || '',
            "state": "",
            "country": country || '', // get this dynamic
            // "address_line": "",
            // "latitude": "46412",
            // "longitude": "12345",
            // "contact_lead": contact_lead || '',
            "app_category": category,
            "category_text": category,
            "app_platform": platform,
            // "cross_platfrom_status": "Yes",
            // "which_cross_platform": "Native",
            "grand_cost": cost + ' ' + currency,
            "enq_date": current_date_for_enq,
            // "favourite": "favourite here",
            // "enq_through": "app OR web",  // need input
            // "enq_from": rd_screen_design,
            // "enquiryfrom": rd_screen_design,
            // "enq_from": utm_source,
            // "enquiryfrom": utm_source,
            "country_code": currency_flag,
            // "choosen_approach": "Native",
            // "choosen_devices": "Smartphones",
            // "choosen_screen_count": 10,   // need inputs
            // "choosen_login_methods": [],  // need inputs
            "choosen_features": leadInfoArr,
            // "choosen_language": "Multiple",
            // "choosen_admin": "Yes ",
            // "admin_efforts": adm_panel_efforts,
            "choosen_webapp": request_from,
            // "secondary_app": other_app_names,
            // "screen_efforts": uiscreenhrs,
            // "webservices": Math.round(webservices_efforts),
            // "webapp_efforts": Math.round(web_efforts),
            // "ios_efforts": Math.round(ios_efforts),
            // "android_efforts": Math.round(android_efforts),
            // "crossplatform_efforts": 0,
            // "secondary_app_efforts": Math.round(secondaryapp_efforts),
            // "features_efforts": 0,    // need inputs
            // "database_efforts": Math.round(db_efforts),
            // "grand_total_efforts": Math.round(total_efforts),
            // "approx_cost": Math.round(total_efforts) + ' ' + conversion_data.currency_name,
            // "timeline_month": timeline,
            "user_comment": comments || '',
            "mail_date": current_date_for_enq || null,
            "apikey": "7dac0fcac909b349"
        })

    };

    return new Promise((resolve, reject) => {
        request(options, function (error, response) {
            if (error) {
                reject(error);
            } else {
                // let res = JSON.parse(response.body)
                // console.log("res", res);
                resolve(response.body)
            }
        });
    });
}
