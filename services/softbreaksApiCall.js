const request = require('request')
const moment = require('moment')

const softbreakApiCall = async(newJob_details, total_weeks,callback, leadtime_req, ...apiCallParams) =>{
    const [resourceStartDate, resourceEndDate, minBudget, maxBudget, name, email, phone, comments,currency_code] = apiCallParams
    let options_inputs = {

        'method': 'POST',

        // 'url': 'https://softbreaksapi.azurewebsites.net/api/JobPosts/CostCalculationForStaffing',
        'url': 'https://api.softbreaks.com/api/JobPosts/CostCalculationForStaffing',

        'headers': {

            'Content-Type': 'application/json',

            'Accept': 'application/json'

        },

        body: JSON.stringify({

            "CompanyID": "3",

            "SkillID_JobIDInputList": newJob_details,

            "LeadTime": leadtime_req.toString(),

            "Duration": total_weeks,

            "UserID": email,

            "UserName": name,

            "StartDate": moment(new Date(resourceStartDate)).format('MM/DD/YYYY').toString(),

            "EndDate": moment(new Date(resourceEndDate)).format('MM/DD/YYYY').toString(),

            "UserContactNo": phone,

            "MinBudget": minBudget,

            "MaxBudget": maxBudget,

            "CurrencyCode": currency_code

        })

    };

    console.log(options_inputs);

    request(options_inputs, function async(error, response) {

        if (error) throw new Error(error);
        // console.log(response.body);

        callback(null, response.body)

    },);


}

module.exports = {
    softbreakApiCall,
}