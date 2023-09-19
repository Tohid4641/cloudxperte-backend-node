const developer = require("../servicesDemos/developer");
const responseJson = require("../servicesDemos/test.json");
const clientRequest = require("../servicesDemos/clientRequest.json");
const moment = require('moment');
const { softbreakApiCall } = require("../services/softbreaksApiCall");
const getGeoDetails = require("../services/getCurrencyCodeApiCall");
const getConversionDetails = require("../services/getCurrencyAmountApiCall");
const sgMail = require('@sendgrid/mail');
var apiModel = require('../model/hire_app_model');
const { json } = require("express");
const { officeCallerApiCall } = require("../services/officeCallerApiCall");

// Skills Job IDs
let android_arr = [1, 2, 3, 4];
let ios_arr = [5, 6, 7, 8];
let reactnative_arr = [9, 10, 11, 12];
let xam_arr = [13, 14, 15, 16];
let flut_arr = [17, 18, 19, 20];
let py_arr = [21, 22, 23, 24];

let otherJobsId = ["25", "26", "", "28", "29", "", "31", "32", "33","110","111"]; // old
let dotnet_arr = [30, 35, 36, 37];
let next_arr = [157, 158, 159, 160];
let angular_arr = [107,113,114,115]
let vue_arr = [108,116,117,118]
let fullstack_arr = [109,119,120,121]
let node_arr = [112,122,123,124]
let reactjs_arr = [125,126,127,128]
let business_arr = [27,38,39,40]

// Hire Mobile App Developer API-1 (FormSubmit)
const submitRequest = async (req, res) => {
  // Skills Object
  let androidSkill = { SkillID: "", JobIDList: [] };
  let iosSkill = { SkillID: "", JobIDList: [] };
  let reactNativeSkill = { SkillID: "", JobIDList: [] };
  let xamSkill = { SkillID: "", JobIDList: [] };
  let flutSkill = { SkillID: "", JobIDList: [] };
  let pySkill = { SkillID: "", JobIDList: [] };
  let dotnetSkill = { SkillID: "", JobIDList: [] };
  let nextSkill = { SkillID: "", JobIDList: [] };
  let angularSkill = { SkillID: "", JobIDList: [] };
  let vueSkill = { SkillID: "", JobIDList: [] };
  let fullstackSkill = { SkillID: "", JobIDList: [] };
  let nodeSkill = { SkillID: "", JobIDList: [] };
  let reactjsSkill = { SkillID: "", JobIDList: [] };
  let businessSkill = { SkillID: "", JobIDList: [] };

  let skill_ids = [];
  let temp_job_details = [];

  // Push Skills object, into Job Details
  let job_details = [];
  let mailSent = false;

  let clientRequestRespone;

  try {
    let {

      job_ids, // step1

      leadtime_req,

      start_date, // step2

      end_date,

      minBudget,

      maxBudget,

      name, // step3

      email,

      phone,

      comments,

    } = req.body; // inputs from frontend side

    

    // Resource Date Converstion

    // 12/20/2022 to 2022-12-20T06:42:21.853Z



    let resourceStartDate = new Date(start_date);

    let resourceEndDate = new Date(end_date);

    

    // check dates validation

    if(resourceEndDate <= resourceStartDate){

      return res.status(500).json({

        result: false,

        error: true,

        message: 'End Date should not be less than or equal to Start Date',

        mailSent: mailSent,

        data: null,

      });

    }

    var currency_code = "USD";

    let conversion_factor = 1;

    let pure_ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

    const apiCallArguments = [resourceStartDate, resourceEndDate, minBudget, maxBudget, name, email, phone, comments]

    //  ================= (seclect developers from options ids) ===================

    for (i = 0; i < job_ids.length; i++) {
      ///////////////////////////////////////////////////
      // check which skills are selected from inputs arr
      if (android_arr.includes(job_ids[i])) {
        // Assign value to SkillID property in androidSkill object
        if (!skill_ids.includes(job_ids[i])) {
          androidSkill["SkillID"] = "1";
        }
        // Push each skills object details into JobIDList property of androidSkill object
        androidSkill["JobIDList"].push({
          JobID: job_ids[i],
          JobTitle: developer[job_ids[i]].JobTitle,
          MinRange: developer[job_ids[i]].MinRange,
          MaxRange: developer[job_ids[i]].MaxRange,
          MinExp: developer[job_ids[i]].MinExp,
          MaxExp: developer[job_ids[i]].MaxExp,
          selected: developer[job_ids[i]].selected,
        });
      }
      /////////////////////////////////////////////////
      if (ios_arr.includes(job_ids[i])) {
        if (!skill_ids.includes(job_ids[i])) {
          iosSkill["SkillID"] = "2";
        }
        iosSkill["JobIDList"].push({
          JobID: job_ids[i],
          JobTitle: developer[job_ids[i]].JobTitle,
          MinRange: developer[job_ids[i]].MinRange,
          MaxRange: developer[job_ids[i]].MaxRange,
          MinExp: developer[job_ids[i]].MinExp,
          MaxExp: developer[job_ids[i]].MaxExp,
          selected: developer[job_ids[i]].selected,
        });
      }
      /////////////////////////////////////////////////
      if (reactnative_arr.includes(job_ids[i])) {
        if (!skill_ids.includes(job_ids[i])) {
          reactNativeSkill["SkillID"] = "3";
        }
        reactNativeSkill["JobIDList"].push({
          JobID: job_ids[i],
          JobTitle: developer[job_ids[i]].JobTitle,
          MinRange: developer[job_ids[i]].MinRange,
          MaxRange: developer[job_ids[i]].MaxRange,
          MinExp: developer[job_ids[i]].MinExp,
          MaxExp: developer[job_ids[i]].MaxExp,
          selected: developer[job_ids[i]].selected,
        });
      }
      /////////////////////////////////////////////////
      if (xam_arr.includes(job_ids[i])) {
        if (!skill_ids.includes(job_ids[i])) {
          xamSkill["SkillID"] = "4";
        }
        xamSkill["JobIDList"].push({
          JobID: job_ids[i],
          JobTitle: developer[job_ids[i]].JobTitle,
          MinRange: developer[job_ids[i]].MinRange,
          MaxRange: developer[job_ids[i]].MaxRange,
          MinExp: developer[job_ids[i]].MinExp,
          MaxExp: developer[job_ids[i]].MaxExp,
          selected: developer[job_ids[i]].selected,
        });
      }
      /////////////////////////////////////////////////
      if (flut_arr.includes(job_ids[i])) {
        if (!skill_ids.includes(job_ids[i])) {
          flutSkill["SkillID"] = "5";
        }
        flutSkill["JobIDList"].push({
          JobID: job_ids[i],
          JobTitle: developer[job_ids[i]].JobTitle,
          MinRange: developer[job_ids[i]].MinRange,
          MaxRange: developer[job_ids[i]].MaxRange,
          MinExp: developer[job_ids[i]].MinExp,
          MaxExp: developer[job_ids[i]].MaxExp,
          selected: developer[job_ids[i]].selected,
        });
      }
      /////////////////////////////////////////////////
      if (py_arr.includes(job_ids[i])) {
        if (!skill_ids.includes(job_ids[i])) {
          pySkill["SkillID"] = "6";
        }
        pySkill["JobIDList"].push({
          JobID: job_ids[i],
          JobTitle: developer[job_ids[i]].JobTitle,
          MinRange: developer[job_ids[i]].MinRange,
          MaxRange: developer[job_ids[i]].MaxRange,
          MinExp: developer[job_ids[i]].MinExp,
          MaxExp: developer[job_ids[i]].MaxExp,
          selected: developer[job_ids[i]].selected,
        });
      }
      /////////////////////////////////////////////////
      if (dotnet_arr.includes(job_ids[i])) {
        if (!skill_ids.includes(job_ids[i])) {
          dotnetSkill["SkillID"] = "12";
        }
        dotnetSkill["JobIDList"].push({
          JobID: job_ids[i],
          JobTitle: developer[job_ids[i]].JobTitle,
          MinRange: developer[job_ids[i]].MinRange,
          MaxRange: developer[job_ids[i]].MaxRange,
          MinExp: developer[job_ids[i]].MinExp,
          MaxExp: developer[job_ids[i]].MaxExp,
          selected: developer[job_ids[i]].selected,
        });
      }
      /////////////////////////////////////////////////
      if (next_arr.includes(job_ids[i])) {
        if (!skill_ids.includes(job_ids[i])) {
          nextSkill["SkillID"] = "37";
        }
        nextSkill["JobIDList"].push({
          JobID: job_ids[i],
          JobTitle: developer[job_ids[i]].JobTitle,
          MinRange: developer[job_ids[i]].MinRange,
          MaxRange: developer[job_ids[i]].MaxRange,
          MinExp: developer[job_ids[i]].MinExp,
          MaxExp: developer[job_ids[i]].MaxExp,
          selected: developer[job_ids[i]].selected,
        });
      }
      /////////////////////////////////////////////////
      if (angular_arr.includes(job_ids[i])) {
        if (!skill_ids.includes(job_ids[i])) {
          angularSkill["SkillID"] = "38";
        }
        angularSkill["JobIDList"].push({
          JobID: job_ids[i],
          JobTitle: developer[job_ids[i]].JobTitle,
          MinRange: developer[job_ids[i]].MinRange,
          MaxRange: developer[job_ids[i]].MaxRange,
          MinExp: developer[job_ids[i]].MinExp,
          MaxExp: developer[job_ids[i]].MaxExp,
          selected: developer[job_ids[i]].selected,
        });
      }
      /////////////////////////////////////////////////
      if (vue_arr.includes(job_ids[i])) {
        if (!skill_ids.includes(job_ids[i])) {
          vueSkill["SkillID"] = "39";
        }
        vueSkill["JobIDList"].push({
          JobID: job_ids[i],
          JobTitle: developer[job_ids[i]].JobTitle,
          MinRange: developer[job_ids[i]].MinRange,
          MaxRange: developer[job_ids[i]].MaxRange,
          MinExp: developer[job_ids[i]].MinExp,
          MaxExp: developer[job_ids[i]].MaxExp,
          selected: developer[job_ids[i]].selected,
        });
      }
      /////////////////////////////////////////////////
      if (fullstack_arr.includes(job_ids[i])) {
        if (!skill_ids.includes(job_ids[i])) {
          fullstackSkill["SkillID"] = "40";
        }
        fullstackSkill["JobIDList"].push({
          JobID: job_ids[i],
          JobTitle: developer[job_ids[i]].JobTitle,
          MinRange: developer[job_ids[i]].MinRange,
          MaxRange: developer[job_ids[i]].MaxRange,
          MinExp: developer[job_ids[i]].MinExp,
          MaxExp: developer[job_ids[i]].MaxExp,
          selected: developer[job_ids[i]].selected,
        });
      }
      /////////////////////////////////////////////////
      if (node_arr.includes(job_ids[i])) {
        if (!skill_ids.includes(job_ids[i])) {
          nodeSkill["SkillID"] = "43";
        }
        nodeSkill["JobIDList"].push({
          JobID: job_ids[i],
          JobTitle: developer[job_ids[i]].JobTitle,
          MinRange: developer[job_ids[i]].MinRange,
          MaxRange: developer[job_ids[i]].MaxRange,
          MinExp: developer[job_ids[i]].MinExp,
          MaxExp: developer[job_ids[i]].MaxExp,
          selected: developer[job_ids[i]].selected,
        });
      }
      /////////////////////////////////////////////////
      if (reactjs_arr.includes(job_ids[i])) {
        if (!skill_ids.includes(job_ids[i])) {
          reactjsSkill["SkillID"] = "33";
        }
        reactjsSkill["JobIDList"].push({
          JobID: job_ids[i],
          JobTitle: developer[job_ids[i]].JobTitle,
          MinRange: developer[job_ids[i]].MinRange,
          MaxRange: developer[job_ids[i]].MaxRange,
          MinExp: developer[job_ids[i]].MinExp,
          MaxExp: developer[job_ids[i]].MaxExp,
          selected: developer[job_ids[i]].selected,
        });
      }
      /////////////////////////////////////////////////
      if (business_arr.includes(job_ids[i])) {
        if (!skill_ids.includes(job_ids[i])) {
          businessSkill["SkillID"] = "9";
        }
        businessSkill["JobIDList"].push({
          JobID: job_ids[i],
          JobTitle: developer[job_ids[i]].JobTitle,
          MinRange: developer[job_ids[i]].MinRange,
          MaxRange: developer[job_ids[i]].MaxRange,
          MinExp: developer[job_ids[i]].MinExp,
          MaxExp: developer[job_ids[i]].MaxExp,
          selected: developer[job_ids[i]].selected,
        });
      }
      /////////////////////////////////////////////////
      otherJobsId.map((eachJobId, index) => {
        if (job_ids[i] == eachJobId) {
          temp_job_details.push({
            JobID: job_ids[i],
            JobTitle: developer[job_ids[i]].JobTitle,
            MinRange: developer[job_ids[i]].MinRange,
            MaxRange: developer[job_ids[i]].MaxRange,
            MinExp: developer[job_ids[i]].MinExp,
            MaxExp: developer[job_ids[i]].MaxExp,
            selected: developer[job_ids[i]].selected,
          });
          // 110 for QA Expert 
          // 111 for UI/UX Expert
          job_details.push({
            SkillID: job_ids[i] == 110 ? "41" : job_ids[i] == 111 ? "42" : (index + 7).toString(),
            JobIDList: [...temp_job_details],
          });
          temp_job_details = [];
        }
      });
    }
    ////////////////////////////////////////////////
    // check if eachSkills JobIDList is not empty if yes then push into job_details
    if (androidSkill["JobIDList"] !== []) {
      job_details.push(androidSkill);
    }
    if (iosSkill["JobIDList"] !== []) {
      job_details.push(iosSkill);
    }
    if (reactNativeSkill["JobIDList"] !== []) {
      job_details.push(reactNativeSkill);
    }
    if (xamSkill["JobIDList"] !== []) {
      job_details.push(xamSkill);
    }
    if (flutSkill["JobIDList"] !== []) {
      job_details.push(flutSkill);
    }
    if (pySkill["JobIDList"] !== []) {
      job_details.push(pySkill);
    }
    if (dotnetSkill["JobIDList"] !== []) {
      job_details.push(dotnetSkill);
    }
    if (nextSkill["JobIDList"] !== []) {
      job_details.push(nextSkill);
    }
    if (angularSkill["JobIDList"] !== []) {
      job_details.push(angularSkill);
    }
    if (vueSkill["JobIDList"] !== []) {
      job_details.push(vueSkill);
    }
    if (fullstackSkill["JobIDList"] !== []) {
      job_details.push(fullstackSkill);
    }
    if (nodeSkill["JobIDList"] !== []) {
      job_details.push(nodeSkill);
    }
    if (reactjsSkill["JobIDList"] !== []) {
      job_details.push(reactjsSkill);
    }
    if (businessSkill["JobIDList"] !== []) {
      job_details.push(businessSkill);
    }

    // remove duplicates
    let newJob_details = job_details.filter((obj) => {
      if (obj.SkillID != "") {
        return obj;
      }
    });

    // //remove same duplicates
    // newJob_details = newJob_details.filter((obj,i,arr)=>{
    //   // Compare the current object with the rest of the array
    //   return (
    //     i ===
    //     arr.findIndex(
    //       (r) =>
    //         r.JobTitle === obj.JobTitle &&
    //         r.SkillID === obj.SkillID &&
    //         r.resourceStartDate === obj.resourceStartDate &&
    //         r.resourceEndDate === obj.resourceEndDate &&
    //         r.cost_per_hrs === obj.cost_per_hrs &&
    //         r.resource_hrs === obj.resource_hrs &&
    //         r.resource_total_cost === obj.resource_total_cost
    //     )
    //   );
    // })

    // ===========================================================================

    // ===================== (Weeks Calculation From Date) ======================

    let a = moment(resourceStartDate, 'YYYY-MM-DD');
    let b = moment(resourceEndDate, 'YYYY-MM-DD');
    let total_weeks = b.diff(a, 'weeks');
    
    let formatted_date_start = moment(resourceStartDate).format('YYYY-MM-DD');
    let formatted_date_end = moment(resourceEndDate).format('YYYY-MM-DD');
    console.log('start date : '+formatted_date_start+' end date : '+formatted_date_end);

    //===========================================================================
    console.log("softbreak payload newJob_details",newJob_details);
    console.log("softbreak payload total_weeks",total_weeks);

    // Get currency code API call using IP

    let geoDetailsData = await getGeoDetails.ipstackApiCall(pure_ip == "::1" ? "22.195.254.15" : pure_ip)

    // change unhide this below line if fixer work
    // currency_code = geoDetailsData.currency.code

    let convertionData = await getConversionDetails.fixerRateConvertionApiCall(currency_code,1496)

    conversion_factor = Math.round(convertionData.info.rate)

    apiCallArguments.push(currency_code)

    console.log("convertionData",convertionData);
    console.log("currency_code",currency_code);
    console.log("conversion_factor", conversion_factor);

    // ===================== (softbreakApiCall) =================================

    softbreakApiCall(

      newJob_details,

      total_weeks,

      function (err, data) {

        if (err) {

          return res.status(500).json({

            result: false,

            error: true,

            message: err.message,

            mailSent: mailSent,

            data: null,

          });

        }

        let respData = JSON.parse(data);

        console.log("softbreak api respons", respData);
        console.log("softbreak api respons CostCalculationSkillList", respData.CostCalculationSkillList[0].CostCalculationJobsList);

        // Dates mismatch conditions according to lead discount requests

        if(respData.Message == "Start Date should be within 1 week from now."){

          return res.status(500).json({

            result: false,

            error: true,

            message:respData.Message,

            mailSent: mailSent,

            data: null,

          });

        }

        else if(respData.Message == "Start Date should be after 2 weeks from now."){

          return res.status(500).json({

            result: false,

            error: true,

            message:respData.Message,

            mailSent: mailSent,

            data: null,

          });

        }

        else if(respData.Message == "Start Date should be after 4 weeks from now."){

          return res.status(500).json({

            result: false,

            error: true,

            message:respData.Message,

            mailSent: mailSent,

            data: null,

          });

        }

        else if(respData.Message == "Start Date should be after 6 weeks from now."){

          return res.status(500).json({

            result: false,

            error: true,

            message:respData.Message,

            mailSent: mailSent,

            data: null,

          });

        }

        // Softbreak API internal error

        else if(respData.CostCalculationSkillList == null) {

          return res.status(500).json({

            result: false,

            error: true,

            messageTitle:

              "Our calculating system has encountered a temporary error",

            message:

              "Please try to perform last action again. if error persists let us know, we will do our bestto fix it.",

            mailSent: mailSent,

            data: null,

          });

        }

        // Else final response

        else{

          finalCalculation(respData); // calling finalCalculation

        }

      },

      leadtime_req,

      ...apiCallArguments

    );

    //===========================================================================

    // ===================== (final calculation from softbrack api response) ======================
    const finalCalculation = async (data) => {
      let resourcesLists = [];
      // data.CostCalculationSkillList.forEach((e)=>{
      //   console.log("each CostCalculationJobsList",e.CostCalculationJobsList);
      // })

      // getGeoDetails(pure_ip == "::1" ? "22.195.254.15" : pure_ip,function(response,err){

      //   if(err){

      //     return res.status(500).json({

      //       result:false,

      //       error:true,

      //       message:err.message,

      //       mailSent: mailSent,

      //       data:null

      //     });

      //   }

      //   if(response){

      //     // set currency_code
      //     console.log("response",response);

      //     currency_code = response.currency_name;

      //   }



      // });



      // currency conversion API call

      // getConversionDetails(currency_code,1496,function(response,err){

      //   if(err){

      //     res.status(500).json({

      //       result:false,

      //       error:true,

      //       message:err.message,

      //       mailSent: mailSent,

      //       data:null

      //     });

      //   }

      //   if(response){

      //     conversion_factor = response.currency_rate

      //     console.log("conversion_factor",conversion_factor)

      //   }

      // })

      let skillLists = []
      console.log(data)

      console.log("currency_code",currency_code)

      data?.CostCalculationSkillList?.map((eachSkill) => {
        eachSkill.CostCalculationJobsList.map((each) => {
          resourcesLists.push({
            JobTitle: each.JobTitle,
            Skill: eachSkill.Skill,
            resourceStartDate: formatted_date_start,
            resourceEndDate: formatted_date_end,
            cost_per_hrs: Math.round(each.HourlyCost) ,//* conversion_factor,
            resource_hrs: Math.round(Math.round(each.Cost) / Math.round(each.HourlyCost)) ,//* conversion_factor,
            resource_total_cost: Math.round(Math.round((Math.round(each.Cost) / Math.round(each.HourlyCost))) * Math.round(each.HourlyCost)) ,//* conversion_factor,
          });
        });
      });

      let users_obj = {};
      let pure_json_obj = {};
      pure_json_obj = resourcesLists;

      clientRequestRespone = {
        name,
        email,
        phone,
        comments,
        requestResources: [...resourcesLists], // Resouces List
        total_weeks: total_weeks,
        total_hrs: data.Duration * 168,
        total_cost: Math.round(
          resourcesLists.reduce((acc, cur) => acc + cur.resource_total_cost, 0)
        ),
        total_cost_per_week: Math.round(
          resourcesLists.reduce((acc, cur) => acc + cur.resource_total_cost, 0) /
          data.Duration
        ),
        currency_code:currency_code 
      };
      resourcesLists = [];

      //Discount calculation using with respect to leadtime_req
      //frontend dependency

      if(leadtime_req.includes("Urgent onboard ASAP ( Within 1 week )")){

        clientRequestRespone = {

          ...clientRequestRespone,

          discount:"+20%",

          orignal_cost: clientRequestRespone.total_cost,

          discounted_cost : Math.round(clientRequestRespone.total_cost * 0.2),

          // orignal_cost : clientRequestRespone.total_cost + Math.round(clientRequestRespone.total_cost * 0.2),

        }

      }

      else if(leadtime_req.includes("A fortnight from now ( within 2 - 3 weeks )")){

        clientRequestRespone = {

          ...clientRequestRespone,

          discount:"+10%",
          
          orignal_cost: clientRequestRespone.total_cost,

          discounted_cost : Math.round(clientRequestRespone.total_cost * 0.1),

          // orignal_cost: clientRequestRespone.total_cost + Math.round(clientRequestRespone.total_cost * 0.1),

        }

      }

      else if(leadtime_req.includes("A month from now (Within 4 - 6 weeks )")){

        clientRequestRespone = {

          ...clientRequestRespone,

          discount:"10%",

          orignal_cost: clientRequestRespone.total_cost,

          discounted_cost : Math.round(clientRequestRespone.total_cost * 0.1),

          // orignal_cost: clientRequestRespone.total_cost - Math.round(clientRequestRespone.total_cost * 0.1),

        }

      }

      else if(leadtime_req.includes("Sometimes Later (1 - 2 months from now)")){

        clientRequestRespone = {

          ...clientRequestRespone,

          discount:"20%",

          orignal_cost: clientRequestRespone.total_cost, 

          discounted_cost : Math.round(clientRequestRespone.total_cost * 0.2),

          // orignal_cost: clientRequestRespone.total_cost - Math.round(clientRequestRespone.total_cost * 0.2),

        }

      }

      // ====================== save requested data and response in db ===========================
      if(clientRequestRespone.requestResources.length > 0){
        let saveHiringDetails = await apiModel.saveHiringDetails(clientRequestRespone);    // all ok
        console.log(saveHiringDetails);
        if (saveHiringDetails.status === true) {
          let saveAllHiringDetails = await apiModel.saveAllHiringDetails(saveHiringDetails.user_id, clientRequestRespone);
        }
      } else{

      }
      
      // =========================================================================================
      // ------------------------ sendgrid email template integration ------------------------------

      // console.log(JSON.stringify(pure_json_obj));
      let job_listing_str = "";
      let sr_no = 0;
      console.log(pure_json_obj);
      pure_json_obj.forEach(job => {
        sr_no++;
        console.log(job.JobTitle);
        job_listing_str += "<tr><td>" + sr_no + "</td><td>" + job.JobTitle + "</td><td>" + job.resourceStartDate + "</td><td>" + job.resourceEndDate + "</td><td>" + job.cost_per_hrs + "</td><td>" + job.resource_hrs + "</td><td>" + job.resource_total_cost + "</td></tr>";
      });

      // const SENDGRID_APY_KEY = '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';
      const SENDGRID_APY_KEY = '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';

      sgMail.setApiKey(SENDGRID_APY_KEY);
      const msg = {
        to: email, // Change to your recipient
        // from: 'info@redbytes.in', // Change to your verified sender
        from: 'info@cloudxperte.com', // Change to your verified sender
        // templateId: 'd-8dc48e510b1449a6bf208f7ad3d83037',   // set template ID
        templateId: 'd-6ecdbfb834f8441aa893ce122b9c6a56',   // set template ID
        dynamicTemplateData: {
          user_name: clientRequestRespone.name,
          // useremail:clientRequestRespone.email,
          // usercontact:clientRequestRespone.phone,
          // usercomments:clientRequestRespone.comments,
          mail_subject:"Hire App Developers Cost Details",
          job_list: job_listing_str,
          total_weeks: clientRequestRespone.total_weeks,
          total_hours: clientRequestRespone.total_hrs,
          // total_cost: clientRequestRespone.orignal_cost,
          total_cost: clientRequestRespone.total_cost,
          total_cost_per_week: clientRequestRespone.total_cost_per_week,
          currency_code: currency_code
        },
      }

      sgMail

        .send(msg)

        .then((response) => {

          // console.log(response[0].statusCode)

          // console.log(response[0].headers)

          console.log('Your mail has been sent successfuly !');

          mailSent = true;

        })

        .catch((error) => {

          return res.status(500).json({

            result: false,

            error: true,

            message: error.message,

            mailSent: mailSent,

            data: null

          });

        })

        // Temprory lead info
        const leadInfoArr = pure_json_obj.map((job)=>{
          return `${job.JobTitle} | Date:${job.resourceStartDate} to ${job.resourceEndDate} | Total Cost : ${job.resource_total_cost}`
        })
        leadInfoArr.unshift(`Discount Leadtime : ${leadtime_req}`)
        leadInfoArr.push(`Duration: ${clientRequestRespone.total_weeks} | Total Hrs: ${clientRequestRespone.total_hrs} | Cost per week: ${clientRequestRespone.total_cost_per_week}`)
        leadInfoArr.push(`Discount: ${clientRequestRespone.discount}`)
        // leadInfoArr.push(`Original cost:${clientRequestRespone.total_cost}`)
        // leadInfoArr.push(`Grand Total Cost : ${clientRequestRespone.orignal_cost}`)
        leadInfoArr.push(`Total cost:${clientRequestRespone.total_cost}`)

      //------------------------------------------------------------------------------------------------
      // Office Caller Lead (CRM)
      const responseLead = await officeCallerApiCall(
        name,
        email,
        phone,
        comments,
        geoDetailsData.city_name,
        geoDetailsData.country_name,
        convertionData.success == true ? geoDetailsData.currency.code : currency_code,
        geoDetailsData.flag_code,
        "Staffing",
        "Hire App Developer",
        leadtime_req,
        req.headers.origin == undefined ? "No" : "Yes",
        clientRequestRespone.total_cost,
        leadInfoArr
      )

      console.log("responseLead",responseLead);
      // ------------------------------------------------------------------------------------------------

      // return res.status(200).json(clientRequestRespone);
      return res.status(200).json({

        result: true,

        error: false,

        message: "Success",

        mailSent: mailSent,

        data: clientRequestRespone

      });

    }
    mailSent = false;
    // ==================================================================================================   

  } catch (error) {

    return res.status(500).json({

      result: false,

      error: true,

      message: error.message,

      mailSent: mailSent,

      data: null

    });

  }

};

const getResponse = async (req, res) => {
  try {
    let resourcesLists = [];

    responseJson.CostCalculationSkillList.map((eachSkill) => {
      eachSkill.CostCalculationJobsList.map((each) => {
        resourcesLists.push({
          JobTitle: each.JobTitle,
          resoStartDate: new Date(),
          resoEndDate: new Date(),
          cost_per_hrs: each.HourlyCost,
          resource_hrs: Math.round(each.Cost / each.HourlyCost),
          resource_total_cost: Math.round(
            (each.Cost / each.HourlyCost) * each.HourlyCost
          ),
        });
      });
    });

    clientRequestRespone = {
      ...clientRequest, // client other info or contact details
      requestResources: [...resourcesLists], // Resouces List
      total_hrs: responseJson.Duration * 168,
      total_cost: Math.round(
        resourcesLists.reduce((acc, cur) => acc + cur.resource_total_cost, 0)
      ),

      total_cost_per_week: Math.round(
        resourcesLists.reduce((acc, cur) => acc + cur.resource_total_cost, 0) /
        responseJson.Duration
      ),
    };

    console.log(resourcesLists);

    resourcesLists = [];

    res.status(200).json(clientRequestRespone);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

const whenToHireDeveloper = (req,res) => {
  try {
    const data = [
    {
      id: 1,
      heading: "Urgent onboard ASAP ( Within 1 week )",
      start_date:moment().add(1, "day").format("DD MMM, YYYY"),
      end_date:moment().add(7, "days").format("DD MMM, YYYY"),
      pricing: "+20% (Premium Pricing)",
    },

    {
      id: 2,
      heading: "A fortnight from now ( within 2 - 3 weeks )",
      start_date:moment().add(8, "days").format("DD MMM, YYYY"),
      end_date:moment().add(4, "weeks").format("DD MMM, YYYY"),
      pricing: "+10% (Premium Pricing)",
    },

    {
      id: 3,
      heading: "A month from now (Within 4 - 6 weeks )",
      start_date:moment().add(29, "days").format("DD MMM, YYYY"),
      end_date:moment().add(6, "weeks").format("DD MMM, YYYY"),
      pricing: "-10% (Discount Pricing)",
    },

    {
      id: 4,
      heading: "Sometimes Later (1 - 2 months from now)",
      start_date:moment().add(6.1, "weeks").format("DD MMM, YYYY"),
      end_date:moment().add(10.5, "weeks").format("DD MMM, YYYY"),
      pricing: "-20% (Discount Pricing)",
    },
  ];

  res.status(200).json({
    message:"success",
    data
  })
  } catch (error) {
    res.status(500).json({
      message:error.message,
      data:null
    })
  }  
}


const submitInquiryForm = async (req, res) => {
  try {
    const { name, email, message, number } = req.body;

    // Custom validation logic
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Invalid name" });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email" });
    }

    if (!number || typeof number !== "number") {
      return res.status(400).json({ error: "Invalid number" });
    }
    
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message" });
    }

    // Save deatils in CRM
    const saveLead = await officeCallerApiCall(
      name,
      email,
      number,
      message,
      undefined,
      undefined,
      undefined,
      undefined,
      "MADC Hire app enquiry form"
    );
    console.log(saveLead);

    res.status(200).json({
      result: true,
      message: "form submitted successfully !",
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: error.message,
    });
  }
}

module.exports = {
  submitRequest,
  getResponse,
  whenToHireDeveloper,
  submitInquiryForm
};
