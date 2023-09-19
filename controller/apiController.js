var apiModel = require('../model/apiModel');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const jade = require('jade');
const path = require('path');
const sgMail = require('@sendgrid/mail');   // for using sendgrid library
const { handleSendGrideEmailSend } = require('../services/handleSendgridEmail');
// const https = require('https');     // for using http library


const domainList = async (req, res, next) => {
    // console.log('called for domain list');
    try {
        let pure_ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
        var domainData = await apiModel.getDomainList(pure_ip);

        setTimeout(() => {
            var complete_array = {
                domain_list: domainData
            }
            var result = { status: 200, domain_list_full: complete_array };
            return res.status(200).json(result);
        }, 100);
    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong f1" })
    }
}

const getPlatForms = async (req, res, next) => {
    try {

        var platforms_arr_json = await apiModel.getAllplatforms();

        let complete_array = {
            status: 200,
            platform_list: platforms_arr_json
        };

        return res.status(200).json(complete_array);
    } catch (err) {
        return res.status(500).json({ status: false, message: "Something went wrong f2" })
    }
}

const getFeatures = async (req, res, next) => {

    // let ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    // console.log('ip address is ---> '+ip);
    try {
        const domain = req.params.domain;

        var domainFeatures = await apiModel.getDomainFeatures(domain);
        setTimeout(() => {
            let complete_array = {
                status: 200,
                functional_feature_list: domainFeatures
            };
            return res.status(200).json(complete_array);

        }, 100);
    } catch (err) {

        return res.status(500).json({ status: false, message: err.message})
    }
}

const getFirstEstimation = async (req, res, next) =>{
    try {
        let request_from = '';
        let first_estimation;
        let origin = req.headers.origin;
        console.log("req.headers.origin =>",req.headers.origin);
        if (origin == undefined) {
            request_from = 'app';   // run for app
        } else {
            request_from = 'web'
        }
        console.log(request_from);
        first_estimation = await apiModel.findAppEstimationFirst(req.body,request_from);


        return res.status(200).json({ status: true, message: "success", first_estimation:first_estimation })
    } catch (err) {

        return res.status(500).json({ status: false, message: "Something went wrong" })
    }
}

const getNonFunctionalFeatures = async (req, res, next) => {
    try {
        let request_from = '';
        let nonFunctionalFtrs;
        let origin = req.headers.origin;
        if (origin == undefined) {
            request_from = 'app';   // run for app
        } else {
            request_from = 'web'
        }
        console.log(request_from);
        let pure_ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
        nonFunctionalFtrs = await apiModel.getNonFunctionalFeatures();
        // if (origin == undefined) {    // request from mobile app
        //     nonFunctionalFtrs = await apiModel.getNonFunctionalFeaturesWithEstimation(req.body,request_from);
        // } else if (origin.search('redbytes.co.uk') > 0) {
        //     nonFunctionalFtrs = await api.Model.getNonFunctionalFeatures();
        // } else if (origin.search('mobileappdevelopmentcost') > 0) {
        //     nonFunctionalFtrs = await apiModel.getNonFunctionalFeaturesWithEstimation(req.body,request_from);
        // } else if (origin == "http://localhost:3000") {
        //     nonFunctionalFtrs = await apiModel.getNonFunctionalFeaturesWithEstimation(req.body,request_from);
        // }
        // else {

        // }
        let complete_array = {
            status: 200,
            nonfunctional_feature_list: nonFunctionalFtrs
        };

        return res.status(200).json(complete_array);

    } catch (err) {
        return res.status(500).json({ status: false, message: "Something went wrong f4" })
    }
}

const getAdminFeatures = async (req, res, next) => {
    try {
        const domain = req.params.domain;
        var adminFeatures = await apiModel.getAdminFeature(domain);

        setTimeout(() => {
            let complete_array = {
                status: 200,
                adminpanel_feature_list: adminFeatures
            };
            return res.status(200).json(complete_array);

        }, 100);

    } catch (err) {
        return res.status(500).json({ status: false, message: "Something went wrong f5" })
    }
}

const getOtherApps = async (req, res, next) => {
    try {
        const domain = req.params.domain;
        var otherApps = await apiModel.getOtherApps(domain);

        setTimeout(() => {
            let complete_array = {
                status: 200,
                other_app_list: (otherApps.length != 0) ? otherApps.other_app : []
            };
            return res.status(200).json(complete_array);

        }, 100);

    } catch (err) {
        return res.status(500).json({ status: false, message: "Something went wrong f6" })
    }
}

const getAppCost = async (req, res, next) => {
    try {
        let request_from = '';
        let pure_ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
        var origin = req.headers.origin;
        if (origin == undefined) {
            // run for app
            request_from = 'app'
        } else {
            request_from = 'web'
        }
        
        if (req.body.selected_domain == undefined || req.body.selected_domain == '' ) {
            return res.status(403).json({ status: false, message: "Please check your input" })
        }
        console.log("req.headers.origin ----- ",req.headers.origin)
        console.log("origin ----- ",origin)
        console.log("request_from ----- ",request_from)
        var costDetails;
        if(origin != undefined && origin.search('redbytes.co.uk') > 0){ 
            var selectedFeatures = req.body.selected_features;
            var selectedDomain = req.body.selected_domain;
            var selectedDomainSlug = req.body.selected_domain_slug;
            var selectedPlatforms = req.body.selected_platforms;    //  ok
            var selectedOtherApps = req.body.selected_other_apps;    //  ok
            costDetails = await apiModel.findAppCostFull(origin,selectedFeatures, selectedDomain, selectedDomainSlug, selectedPlatforms, selectedOtherApps, pure_ip, request_from);

            let complete_array = {
                status: 200,
                data: costDetails
            };

            return res.status(200).json(complete_array);
        }
        else if(origin == undefined || origin == "http://localhost:3000" || origin.search('mobileappdevelopmentcost') > 0) {
            console.log("'primary'-secondary-admin----------->",req.body.primary_app_estimation)
            console.log("primary-'secondary'-admin----------->",req.body.secondary_app_estimation)
            console.log("primary-secondary-'admin'----------->",req.body.admin_panel_estimation)

            //check all estimations
            if (
            req.body.primary_app_estimation == undefined || req.body.primary_app_estimation == '' || 
            req.body.secondary_app_estimation == undefined || req.body.secondary_app_estimation == '' ||
            req.body.admin_panel_estimation == undefined || req.body.admin_panel_estimation == ''
            //  ||
            // req.body.non_functional_estimation == undefined || req.body.non_functional_estimation == ''
            ) {
                return res.status(403).json({ status: false, message: "Please check your input" });
            }

            let primary_app_estimation = req.body.primary_app_estimation;
            let secondary_app_estimation = req.body.secondary_app_estimation;
            let admin_panel_estimation = req.body.admin_panel_estimation; 
            let tertiary_app_estimation = req.body.tertiary_app_estimation || 0; 
            let non_functional_estimation = req?.body?.non_functional_estimation || 0; 
            costDetails = await apiModel.findAppCost(pure_ip, request_from, primary_app_estimation, secondary_app_estimation, admin_panel_estimation, tertiary_app_estimation,non_functional_estimation);

            let complete_array = {
                status: 200,
                data: costDetails
            };
            return res.status(200).json(complete_array);
        }
        else{
            return res.status(500).json({message:"Invalid or Undefined origin!"});
        }
        // setTimeout(() => {
        //     let complete_array = {
        //         status: 200,
        //         data: costDetails
        //     };
            
        //     return res.status(200).json(complete_array);

        // }, 100);
    } catch (err) {
        console.log("err in get-app-cost : ",err.message)
        return res.status(500).json({ status: false, message: err.message })
    }
}

const saveContactInfo = async (req, res, next) => {
    let request_from = '';
    // let remote_addr = req.socket.remoteAddress;
    var origin = req.headers.origin;
    console.log(origin);
    if (origin == undefined) {
        request_from = 'app';   // run for app
    } else {
        request_from = 'web'
    }
    let template_version = '';
    let primary_app_estimation = 255;
    let secondary_app_estimation = 123;
    let admin_panel_estimation = 300;
    let pure_ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    let mail_sender;
    let utm_source = req.body.utm_source || "MADC_LP" // defaut blue
    
    let mail_subject;
    let mail_attachment_name;

    try {
        if (req.body.contactmeOptions == "" || req.body.user_contact == '' || req.body.user_email == '' || req.body.user_name == '' || req.body.step1_domain_data == '') {
            return res.status(403).json({ status: false, message: "Please check your inputs" })
        }
        var saveUser = await apiModel.saveContactUser(req.body);    // all ok
        if (saveUser.status === true) {
            if (origin == undefined) {    // request from mobile app
                template_version = 'red';
                mail_sender = "services@redbytes.co.uk";
                mail_subject = "Mobile App Cost Estimation"
                mail_attachment_name = "Mobile-App-Cost-Estimation"
                var getAllCostEstimationCX = await apiModel.getAllCostEstimationCX(req.body, saveUser.user_id, pure_ip, template_version, request_from, origin, mail_sender,mail_subject,mail_attachment_name);
                return res.status(200).json(getAllCostEstimationCX);
            } else if (origin.search('redbytes.co.uk') > 0) {
                template_version = 'red';
                mail_sender = "services@redbytes.co.uk";
                mail_subject = "App Development Cost Details"
                mail_attachment_name = "App-Development-Cost-Details"
                var getAllCostEstimation = await apiModel.getAllCostEstimation(req.body, saveUser.user_id, pure_ip, origin, mail_sender,mail_subject,mail_attachment_name);
                return res.status(200).json(getAllCostEstimation);
            } else if (origin.search('mobileappdevelopmentcost') > 0) {
                console.log('called for mobileappdevelopmentcost ' + saveUser.user_id);

                mail_subject = "App Development Cost Details"
                mail_attachment_name = "App-Development-Cost-Details"

                if(utm_source == "RB_UK" || utm_source == "RB_IN"){
                    template_version = 'red';
                    mail_sender = "services@redbytes.co.uk";
                }else if(utm_source == "Probytes_LP"){
                    template_version = 'purple';
                    mail_sender = "info@probytes.net";
                }else{
                    template_version = 'blue';
                    mail_sender = "info@cloudxperte.com";
                }

                var getAllCostEstimationCX = await apiModel.getAllCostEstimationCX(req.body, saveUser.user_id, pure_ip, template_version, request_from, origin, mail_sender,mail_subject,mail_attachment_name);
                return res.status(200).json(getAllCostEstimationCX);
                // return res.status(200).json({status:true, message:"User add succeed", user_id:saveUser.user_id});
            } else if (origin == "http://localhost:3000") {

                mail_subject = "App Development Cost Details"
                mail_attachment_name = "App-Development-Cost-Details"

                if(utm_source == "RB_UK" || utm_source == "RB_IN"){
                    template_version = 'red';
                    mail_sender = "services@redbytes.co.uk";
                }else if(utm_source == "Probytes_LP"){
                    template_version = 'purple';
                    mail_sender = "info@probytes.net";
                }else{
                    template_version = 'blue';
                    mail_sender = "info@cloudxperte.com";
                }

                // template_version = 'red';
                var getAllCostEstimationCX = await apiModel.getAllCostEstimationCX(req.body, saveUser.user_id, pure_ip, template_version, request_from, origin,mail_sender,mail_subject,mail_attachment_name);
                return res.status(200).json(getAllCostEstimationCX);
            }
            else {

            }

            //  return res.status(200).json({status:true, message:"User add succeed", user_id:saveUser.user_id})   //ok
        } else {
            return res.status(500).json({ status: false, message: "Something went wrong in saveContactUser" })
        }


    } catch (err) {
        return res.status(500).json({ status: false, message: err.message })
    }
}

const costReduce = async (req, res, next) => {
    var origin = req.headers.origin;
    try {
        if (req.body.user_id == '' || req.body.workingEfforts == '' || req.body.step1_domain_data == '' || req.body.step2_platform_data == undefined || !Array.isArray(req.body.step2_platform_data) || (typeof req.body.step3_feature_data != 'object' && req.body.step3_feature_data === null) || (typeof req.body.step4_NonFunctional_data != 'object' && req.body.step4_NonFunctional_data == null) || (typeof req.body.AdminPanel_data != 'object' && req.body.AdminPanel_data == null)) {
            return res.status(403).json({ status: false, message: "Please check your input" })
        }

        var getAllCostEstimation = await apiModel.getAllCostEstimation(req.body, req.body.user_id,origin);
        return res.status(200).json(getAllCostEstimation);


    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, message: "Something went wrong f8" })
    }
}

// new function for getting reduced cost
const getReducedCost = async (req, res, next) => {
    var origin = req.headers.origin;
    let template_version = '';
    let utm_source = req.body.utm_source || "MADC_LP" // defaut blue
    mail_subject = "Reduction App Development Cost Details"
    mail_attachment_name = "Reduction-App-Development-Cost-Details"

    try {
        let pure_ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
        // if( req.body.user_id == '' || req.body.workingEfforts == '' || req.body.step1_domain_data == '' || req.body.step2_platform_data == undefined || !Array.isArray(req.body.step2_platform_data) || (typeof req.body.step3_feature_data != 'object' && req.body.step3_feature_data === null)|| (typeof req.body.step4_NonFunctional_data != 'object' && req.body.step4_NonFunctional_data == null ) || (typeof req.body.AdminPanel_data != 'object' && req.body.AdminPanel_data == null)){ 
        //     return res.status(403).json({status:false, message:"Please check your input"})
        // }
        // if(req.body.user_id == '' || !totalEfforts || !totalCost || !selectedTimeline || !finalCostReduced || !finaleffortsInHrs ){
        //     return res.status(403).json({status:false, message:"Please check your input"})
        // }
        if (origin == undefined) {     // request from mobile app
            template_version = 'red';

            mail_sender = "services@redbytes.co.uk";
            
            var getCostReductionDetailsCX = await apiModel.getCostReductionDetailsCX(req.body, req.body.user_id, pure_ip, template_version, origin, mail_sender,mail_subject,mail_attachment_name,utm_source);
            return res.status(200).json(getCostReductionDetailsCX);
        }
        else if (origin.search('redbytes.co.uk') > 0) {
            template_version = 'red';

            mail_sender = "services@redbytes.co.uk";

            var getCostReductionDetails = await apiModel.getCostReductionDetails(req.body, req.body.user_id, pure_ip, mail_sender,mail_subject,mail_attachment_name,utm_source);
            return res.status(200).json(getCostReductionDetails);
        }
        else if (origin == "http://localhost:3000") {

            if(utm_source == "RB_UK" || utm_source == "RB_IN"){
                template_version = 'red';
                mail_sender = "services@redbytes.co.uk";
            }else if(utm_source == "Probytes_LP"){
                template_version = 'purple';
                mail_sender = "info@probytes.net";
            }else{
                template_version = 'blue';
                mail_sender = "info@cloudxperte.com";
            }

            var getCostReductionDetailsCX = await apiModel.getCostReductionDetailsCX(req.body, req.body.user_id, pure_ip, template_version, origin, mail_sender,mail_subject,mail_attachment_name,utm_source);
            return res.status(200).json(getCostReductionDetailsCX);
        }
        else if (origin.search('mobileappdevelopmentcost') > 0) {

            if(utm_source == "RB_UK" || utm_source == "RB_IN"){
                template_version = 'red';
                mail_sender = "services@redbytes.co.uk";
            }else if(utm_source == "Probytes_LP"){
                template_version = 'purple';
                mail_sender = "info@probytes.net";
            }else{
                template_version = 'blue';
                mail_sender = "info@cloudxperte.com";
            }

            console.log('called for cloudxperte');
            var getCostReductionDetailsCX = await apiModel.getCostReductionDetailsCX(req.body, req.body.user_id, pure_ip, template_version,origin, mail_sender,mail_subject,mail_attachment_name,utm_source);
            return res.status(200).json(getCostReductionDetailsCX);
        }




    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, message: err.message })
    }
}

const sendEmailsOnSubmission = async (req, res, next) => {
    const SENDGRID_APY_KEY = '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';
    sgMail.setApiKey(SENDGRID_APY_KEY);
    const msg = {
        to: 'shubhangiramekar48@gmail.com', // Change to your recipient
        from: 'info@redbytes.in', // Change to your verified sender
        subject: 'Test Email from RB UK',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }

    sgMail
        .send(msg)
        .then((response) => {
            return res.status(200).json({ status: true, message: "success" })
            // console.log('success');
            // console.log(response[0].statusCode)
            // console.log(response[0].headers)
        })
        .catch((error) => {
            return res.status(500).json({ status: false, message: error })
            // console.log('error');
            // console.error(error)
        })

}

const sendAcceptButtonMail = async(req, res) => {
    if (req.body.user_name == '' || req.body.user_email == '') {
        return res.status(403).json({ status: false, message: "Please check your input" })
    }
    let { user_name, user_email } = req.body;
    let subject = 'Thanks You - From App Cost Calculator Team'
    let domain_logo_for_acceptReducedCostMail;
    let sender;
    let template_version;
    let utm_source = req.body.utm_source || "MADC_LP" // defaut blue
    let mail_response;
    let origin = req.headers.origin;

    try {

        if (origin == undefined) {    // request from mobile app

            template_version = 'red';
            sender = "services@redbytes.co.uk";

        } else if (origin.search('redbytes.co.uk') > 0) {

            template_version = 'red';
            sender = "services@redbytes.co.uk";

        } else if (origin.search('mobileappdevelopmentcost') > 0) {

            if(utm_source == "RB_UK" || utm_source == "RB_IN"){
                template_version = 'red';
                sender = "services@redbytes.co.uk";
            }else if(utm_source == "Probytes_LP"){
                template_version = 'purple';
                sender = "info@probytes.net";
            }else{
                template_version = 'blue';
                sender = "info@cloudxperte.com";
            }

        } else if (origin == "http://localhost:3000") {

            if(utm_source == "RB_UK" || utm_source == "RB_IN"){
                template_version = 'red';
                sender = "services@redbytes.co.uk";
            }else if(utm_source == "Probytes_LP"){
                template_version = 'purple';
                sender = "info@probytes.net";
            }else{
                template_version = 'blue';
                sender = "info@cloudxperte.com";
            }      
        }else{

        }

        // Mail template
        const reduced_accept_mail_path = path.join(__dirname ,"../views/reduced_accept_mail.ejs");
        // console.log("reduced_accept_mail_path",reduced_accept_mail_path)
        const reduced_accept_mail = await ejs.renderFile(reduced_accept_mail_path,{user_name,utm_source});

        mail_response = await handleSendGrideEmailSend(user_email,reduced_accept_mail,sender,subject);

        
        if(mail_response.mail_sent == 0){
            return res.status(200).json({ status: false, ...mail_response })
        }
        return res.status(200).json({ status: true, ...mail_response })

        
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message })
    }


}

const saveLeadInCRM = async (req, res, next) => {
    console.log('called function');
    // return res.status(200).json({ status: true, message: "success" });
    var saveLead = await apiModel.saveLead(req.body);
    console.log(saveLead);
    if (saveLead.status == true) {
        return res.status(200).json({ status: true, message: "Lead Created Successfully" });   //ok
    } else {
        return res.status(500).json({ status: false, message: "Something went wrong." });
    }
}


const contactMeOptions = async (req, res, next) => {
    try {
        var contactme_arr_json = await apiModel.getContactMeOptions();
        let complete_array = {
            status: 200,
            contactme_list: contactme_arr_json
        };
        return res.status(200).json(complete_array);
    } catch (err) {
        return res.status(500).json({ status: false, message: "Something went wrong f2" })
    }

}

// api for cloudXperte
const getModules = async (req, res, next) => {
    try {
        const domain = req.params.domain;

        var domainModules = await apiModel.getDomainModules(domain);
        setTimeout(() => {
            let complete_array = {
                status: 200,
                module_list_full: domainModules
            };
            return res.status(200).json(complete_array);

        }, 100);
    } catch (err) {

        return res.status(500).json({ status: false, message: "Something went wrong" })
    }
}

const getModularFeatureList = async (req, res, next) => {
    try {
        const domain = req.params.domain;
        // const module_slug = req.params.module_slug;

        var modularFeatures = await apiModel.getModularFeatures(domain);
        setTimeout(() => {
            let complete_array = {
                status: 200,
                modular_list_full: modularFeatures
            };
            return res.status(200).json(complete_array);

        }, 100);
    } catch (err) {

        return res.status(500).json({ status: false, message: "Something went wrong" })
    }
}

module.exports = {
    domainList,
    getPlatForms,
    getFeatures,
    getNonFunctionalFeatures,
    getAdminFeatures,
    getOtherApps,
    getAppCost,
    saveContactInfo,
    costReduce,
    getReducedCost,
    sendEmailsOnSubmission,
    sendAcceptButtonMail,
    saveLeadInCRM,
    contactMeOptions,
    getModules,
    getModularFeatureList,
    getFirstEstimation
}