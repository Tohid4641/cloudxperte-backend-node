const fetch = require('node-fetch');
const configModel = require('./configModel').data;
const db = require('../db');
var datetime = require('node-datetime');
const sgMail = require('@sendgrid/mail');   // for using sendgrid library
var request = require('request');
const cronjob = require('node-cron');
const axios = require('axios')
const html_pdf_node = require('html-pdf-node');
const fs = require('fs');
const path = require('path');
const { log } = require('console');

const getDomainList = async (pure_ip) => {
  global.globalString = "string changed";
  let output_obj = {}
  var arr_domain = [];
  var data = await fetchGetMethod('step_1_domain_list');
  let arr1 = data.domain_all.dname;
  let arr2 = data.domain_all.dslug;
  let arr3 = data.domain_all.ddescription;
  let arr4 = data.domain_all.domain_img;
  for (let j in arr1) { // prepare list
    arr_domain.push({
      'd_name': arr1[j].replace(/&amp;/g, '&'),
      'd_slug': arr2[j],
      'd_icon': arr3[j],
      'd_img': arr4[j],
    });
  }
  // get currency data 
  let currency_name = ''
  const geo_data = await getGeoDetails(pure_ip);
  currency_name = geo_data.currency_name;
  let flag_url = geo_data.flag_url;
  output_obj = {
    arr_domain:arr_domain,
    currency_name:currency_name,
    flag_url:flag_url
  }
  return output_obj;
}

const getAllplatforms = async () => {
  let platforms_arr_json = [
    { 'platform': 'Android', 'icon_class': 'fab fa-android', 'slug': "android" },
    { 'platform': 'iOS', 'icon_class': 'fab fa-apple', 'slug': "ios" },
    { 'platform': 'Web', 'icon_class': 'fa fa-globe', 'slug': "web" },

  ];

  return platforms_arr_json;
}

const getDomainFeatures = async (domain) => {
  let feature_list_basic_arr = [];
  let feature_list_advance_arr = [];
  var features = await fetchGetMethod('step_3_feature_list?sel_domain=' + domain);

  let list_basic = features.feature_list_basic;
  let list_advance = features.feature_list_advance;

  let name_basic = list_basic.feature_name;
  let unit_basic = list_basic.feature_unit;
  let factor_basic = list_basic.feature_wt_factor;

  let name_advance = list_advance.feature_name;
  let unit_advance = list_advance.feature_unit;
  let factor_advance = list_advance.feature_wt_factor;

  var str_only = '';
  for (let j in name_basic) { // prepare basic list
    str_only = name_basic[j].replace(/[^a-zA-Z ]/g, "");  // exclude special symbols from string

    feature_list_basic_arr.push({
      'feature': name_basic[j],
      'feature_key': (str_only.replace(/ /g, "-")).toLowerCase(),
      'feature_unit': unit_basic[j],
      'feature_wt_factor': factor_basic[j],
    });
  }

  for (let k in name_advance) {   // prepare advance list
    str_only = name_advance[k].replace(/[^a-zA-Z ]/g, "");
    feature_list_advance_arr.push({
      'feature': name_advance[k],
      'feature_key': (str_only.replace(/ /g, "-")).toLowerCase(),
      'feature_unit': unit_advance[k],
      'feature_wt_factor': factor_advance[k],
    });
  }

  var result = {
    basic_list: feature_list_basic_arr,
    advance_list: feature_list_advance_arr
  }

  return result;
}

const getNonFunctionalFeaturesWithEstimation = async (request_from) => {
  const estimated_hrs = await findAppEstimationFirst(request_from);
  const arr_basic = [
    {
      'feature': 'Splash / Launch / Branding Screen',
      'feature_key': 'splash-launch-screen',
    },
    {
      'feature': 'Forgot / Reset Password',
      'feature_key': 'forget-reset-password',
    },
    {
      'feature': 'Single Language Support',
      'feature_key': 'single-language-support',
    },
    {
      'feature': 'Multi-Language',
      'feature_key': 'multi-language',
    },
    {
      'feature': 'Terms and Conditions',
      'feature_key': 'terms-and-conditions',
    },
  ];

  const arr_advance = [
    {
      'feature': 'Privacy Policy',
      'feature_key': 'privacy-policy',
    },
    {
      'feature': 'About Us',
      'feature_key': 'about-us',
    },
    {
      'feature': 'Security Policy',
      'feature_key': 'security-policy',
    },
    {
      'feature': 'FAQs',
      'feature_key': 'faqs',
    },
    {
      'feature': 'Contact Us',
      'feature_key': 'contact-us',
    },
  ];
  var result = {
    basic_list: arr_basic,
    advance_list: arr_advance,
    estimated_hrs: estimated_hrs
  }

  return result;   
}

const getFirstLevelEstimation = async (data, request_from) => {
  const estimated_hrs = await findAppEstimationFirst(data, request_from);
  var result = {
    estimated_hrs: estimated_hrs
  }
  return result;   
}


const getNonFunctionalFeatures = async () => {
  const arr_basic = [
    {
      'feature': 'Splash / Launch / Branding Screen',
      'feature_key': 'splash-launch-screen',
    },
    {
      'feature': 'Forgot / Reset Password',
      'feature_key': 'forget-reset-password',
    },
    {
      'feature': 'Single Language Support',
      'feature_key': 'single-language-support',
    },
    {
      'feature': 'Multi-Language',
      'feature_key': 'multi-language',
    },
    {
      'feature': 'Terms and Conditions',
      'feature_key': 'terms-and-conditions',
    },
  ];

  const arr_advance = [
    {
      'feature': 'Privacy Policy',
      'feature_key': 'privacy-policy',
    },
    {
      'feature': 'About Us',
      'feature_key': 'about-us',
    },
    {
      'feature': 'Security Policy',
      'feature_key': 'security-policy',
    },
    {
      'feature': 'FAQs',
      'feature_key': 'faqs',
    },
    {
      'feature': 'Contact Us',
      'feature_key': 'contact-us',
    },
  ];
  var result = {
    basic_list: arr_basic,
    advance_list: arr_advance,
  }

  return result;   
}

const getAdminFeature = async (domain) => {
  let admin_feature_basic = [];
  let admin_feature_advance = [];
  var features = await fetchGetMethod('step_5_adminpanel_feature_list?sel_domain=' + domain);

  var list_basic = features.adminpanel_feature_list_basic;
  var list_advance = features.adminpanel_feature_list_advance;

  for (let j = 0; j < list_basic.length; j++) { // prepare basic list
    str_only1 = (list_basic[j]).replace(/[^a-zA-Z ]/g, "");
    admin_feature_basic.push({
      'feature': list_basic[j].replace(/&amp;/g, '&'),
      'feature_key': (str_only1.replace(/ /g, "-")).toLowerCase(),
    });
  }

  for (let k = 0; k < list_advance.length; k++) {   // prepare advance list
    str_only1 = (list_advance[k]).replace(/[^a-zA-Z ]/g, "");
    admin_feature_advance.push({
      'feature': list_advance[k].replace(/&amp;/g, '&'),
      'feature_key': (str_only1.replace(/ /g, "-")).toLowerCase(),
    });
  }

  var result = {
    basic_list: admin_feature_basic,
    advance_list: admin_feature_advance
  }

  return result;
}

const getOtherApps = async (domain) => {
  var apps = await fetchGetMethod('step_6_other_app_list?sel_domain=' + domain);
  // var data = apps.other_app;
  return apps;
}

const getFeatureUnits = async () => {
  var units = [
    'user-inputs-ei',
    'user-outputs-eo',
    'user-inquiries-eq',
    'hardware-integrations-hi',
    '3rd-party-api-integrations-si'
  ];

  return units;
}

const getFeatureUnitsForApp = async () => {
  var units = [
    'EI',
    'EO',
    'EQ',
    'HI',
    'SI'
  ];
  return units;
}

const findSumOfEachUnit = (features, featureUnit, request_from,origin) => {
  var unitValueArray;
  if(request_from == 'app'){
    unitValueArray = getUnitValuesForApp();
  } else{

    if(origin && origin.search('redbytes.co.uk') > 0){
      unitValueArray = getUnitValues();
    }else{
      unitValueArray = getUnitValuesForApp();
    }

  }
  
  const unitValueLow = unitValueArray.filter(function (e) { return e.unit == featureUnit && e.factor == 'simple' }).map(ele => ele.value);
  const unitValueAverage = unitValueArray.filter(function (e) { return e.unit == featureUnit && e.factor == 'average' }).map(ele => ele.value);
  const unitValueHigh = unitValueArray.filter(function (e) { return e.unit == featureUnit && e.factor == 'high' }).map(ele => ele.value);

  //Find  simple count
  const eiArrayLow = features.filter(function (e) { return e.feature_unit == featureUnit && (e.feature_wt_factor).toLowerCase() == 'simple' }).map(ele => ele);
  const countOfEiLow = eiArrayLow.length;

  //Find  average count
  const eiArrayAverage = features.filter(function (e) { return e.feature_unit == featureUnit && (e.feature_wt_factor).toLowerCase() == 'average' }).map(ele => ele);
  const countOfEiAverage = eiArrayAverage.length;

  //Find  High count
  const eiArrayHigh = features.filter(function (e) { return e.feature_unit == featureUnit && (e.feature_wt_factor).toLowerCase() == 'high' }).map(ele => ele);
  const countOfEiHigh = eiArrayHigh.length;

  var sum = (unitValueLow * countOfEiLow) + (unitValueAverage * countOfEiAverage) + (unitValueHigh * countOfEiHigh);
  return sum;
}

const findAppEstimationFirst = async (data, request_from) =>{
  console.log('function called findAppEstimationFirst()');
  console.log(data);
  var domanComplexityValue = 0;
  var factorSumArray = [];
  let features = data.selected_features;
  let selectedDomainSlug = data.selected_domain_slug;
  let sel_platforms = data.step2_platform_data;
  let allUnits;
  if(request_from == 'app'){
    allUnits = await getFeatureUnitsForApp();
  } else{
    // allUnits = await getFeatureUnits();
    allUnits = await getFeatureUnitsForApp();
  }
  console.log('allUnits ----------> '+allUnits);
  allUnits.forEach(value => {
    var sumOfEachunit = findSumOfEachUnit(features, value, request_from);
    factorSumArray.push(sumOfEachunit);
  })
  console.log("factorSumArray = ",factorSumArray)
  console.log('fgdghfgh ');
  var UPF = factorSumArray.reduce((a, b) => a + b, 0);
  console.log('upf ----------> '+UPF);
  var complexityValues = await getdomainComplexityValue();    // need to check with domain slug
  const complexity_val = complexityValues.filter(function (e) { return e.d_slug == selectedDomainSlug }).map(ele => ele.value);
  if (complexity_val.length != 0) {
    domanComplexityValue = complexity_val[0];
  } else {
    domanComplexityValue = 0
  }
  console.log('domanComplexityValue ----------> '+domanComplexityValue);
  var CAF = parseFloat(0.65 + (0.01 * domanComplexityValue)).toFixed(2);    // Complexity Adjustment Factor
  console.log('CAF ----------> '+CAF);
  var functionalPoint = parseFloat(UPF * CAF).toFixed(2);
  console.log('functionalPoint ----------> '+functionalPoint);
  var workingEfforts = parseFloat(functionalPoint * 8);//8 is total working hours in a day
  console.log('workingEfforts ----------> '+workingEfforts);
  // all fixed values and declarations

  var percent_of = 60;    // for web platform
  let total_hrs_for_single = workingEfforts;
  console.log('total_hrs_for_single ----------> '+total_hrs_for_single);
  var frontend_total_hrs = 0;
  // platform selected 
  var total_platforms = 0;
  var pl_android = 0; var pl_ios = 0; var pl_web = 0;

  var TotalEffortCntAndriodApp = 0;
  var TotalEffortCntIOSApp = 0;
  var TotalEffortCntwebApp = 0;

  if (sel_platforms.includes("Android") == true) {
    pl_android = 1;
    TotalEffortCntAndriodApp = total_hrs_for_single;
    frontend_total_hrs = TotalEffortCntAndriodApp + TotalEffortCntIOSApp + TotalEffortCntwebApp;
  }
  if (sel_platforms.includes("iOS") == true) {
    pl_ios = 1;
    TotalEffortCntIOSApp = total_hrs_for_single;
    frontend_total_hrs = TotalEffortCntAndriodApp + TotalEffortCntIOSApp + TotalEffortCntwebApp;
  }
  if (sel_platforms.includes("Web") == true) {
    pl_web = 1;
    TotalEffortCntwebApp = ((percent_of / 100) * total_hrs_for_single);
    frontend_total_hrs = TotalEffortCntAndriodApp + TotalEffortCntIOSApp + TotalEffortCntwebApp;
  }
  total_platforms = parseInt(pl_android) + parseInt(pl_ios) + parseInt(pl_web);
  console.log('total_platforms ------>'+total_platforms);
  console.log('frontend_total_hrs ------>'+frontend_total_hrs);
  var hours_cnt_total = Math.round(frontend_total_hrs)+ ' HRS';

  return hours_cnt_total;
}
 
const findAppCostFull = async (origin,features, domain, selectedDomainSlug, sel_platforms, sel_other_apps, remote_ip, request_from) => {
  var domanComplexityValue = 0;
  
  let factorSumArray2 = [0,9,5,7];
  let allUnits;
  if(request_from == 'app'){
    allUnits = await getFeatureUnitsForApp();
  } else{
    allUnits = await getFeatureUnits();
  }
  let factorSumArray = [0];
  allUnits.forEach(value => {
    var sumOfEachunit = findSumOfEachUnit(features, value, request_from,origin);
    console.log("sumOfEachunit||||||||||||||||------>",sumOfEachunit)
    factorSumArray.push(sumOfEachunit);
  })
  console.log("factorSumArray--------->get-app-cost----->",factorSumArray);
  console.log('dflksdflk');
  var UPF = factorSumArray.reduce((a, b) => a + b, 0);
  console.log('upf ----------> '+UPF);
  var complexityValues = await getdomainComplexityValue();
  
  const complexity_val = complexityValues.filter(function (e) { return e.d_slug == selectedDomainSlug }).map(ele => ele.value);
  if (complexity_val.length != 0) {
    domanComplexityValue = complexity_val[0];
  } else {
    domanComplexityValue = 0
  }
  console.log('domanComplexityValue ----------> '+domanComplexityValue);
  var CAF = parseFloat(0.65 + (0.01 * domanComplexityValue)).toFixed(2);    // Complexity Adjustment Factor
  console.log('CAF ----------> '+CAF);
  var functionalPoint = parseFloat(UPF * CAF).toFixed(2);
  console.log('functionalPoint ----------> '+functionalPoint);
  var workingEfforts = parseFloat(functionalPoint * 8);//8 is total working hours in a day
  console.log('workingEfforts ----------> '+workingEfforts);
  // all fixed values and declarations
  var admin_panel_per_app = 100;
  var webservices_per_platform = 20;
  var database_per_app = 10;
  var percent_of = 60;    // for web platform
  var other_app_percent_of = 40;  // for other app
  var non_functional_fts_hrs = 100;   // 100 for non_functional_fts_hrs is fixed
  var uiscreenhrs = 150;
  var fn_nfn_hrs_total = parseFloat(workingEfforts + non_functional_fts_hrs);
  let total_hrs_for_single = workingEfforts;
  console.log('total_hrs_for_single ----------> '+total_hrs_for_single);
  var frontend_total_hrs = 0;
  // platform selected 
  var total_platforms = 0;
  var pl_android = 0; var pl_ios = 0; var pl_web = 0;

  var TotalEffortCntAndriodApp = 0;
  var TotalEffortCntIOSApp = 0;
  var TotalEffortCntwebApp = 0;

  if (sel_platforms.includes("Android") == true) {
    pl_android = 1;
    TotalEffortCntAndriodApp = total_hrs_for_single;
    frontend_total_hrs = TotalEffortCntAndriodApp + TotalEffortCntIOSApp + TotalEffortCntwebApp;
  }
  if (sel_platforms.includes("iOS") == true) {
    pl_ios = 1;
    TotalEffortCntIOSApp = total_hrs_for_single;
    frontend_total_hrs = TotalEffortCntAndriodApp + TotalEffortCntIOSApp + TotalEffortCntwebApp;
  }
  if (sel_platforms.includes("Web") == true) {
    pl_web = 1;
    TotalEffortCntwebApp = ((percent_of / 100) * total_hrs_for_single);
    frontend_total_hrs = TotalEffortCntAndriodApp + TotalEffortCntIOSApp + TotalEffortCntwebApp;
  }
  total_platforms = parseInt(pl_android) + parseInt(pl_ios) + parseInt(pl_web);
  console.log('total_platforms ------>'+total_platforms);
  console.log('frontend_total_hrs ------>'+frontend_total_hrs);
  // other app selected 
  var app_primary = 0; var app_secondary = 0;
  var total_apps = 1;   // 1 for main app compulsory (other app selection is not needed)
  console.log('sel_other_apps ---------> '+sel_other_apps);
  if (sel_other_apps && sel_other_apps.includes("primary_app") == true) {
    app_primary = 1;
  } else{
    app_primary = 0;
  }
  if (sel_other_apps && sel_other_apps.includes("Secondary_app") == true) {
    app_secondary = 1;
  } else{
    app_secondary = 0;
  }
  total_apps = parseInt(total_apps) + parseInt(app_primary) + parseInt(app_secondary);
  var screen_hrs_total = uiscreenhrs * total_apps;

  var webservices_hrs = webservices_per_platform * total_platforms;
  var database_hrs = database_per_app * total_apps;
  var admin_panel_hrs = admin_panel_per_app * total_apps;
  var backend_hrs = webservices_hrs + database_hrs + admin_panel_hrs;
  // var backend_hrs = 300;
  // calculate hours for secondary apps
  var other_app_only = 0;
  other_app_only = app_primary + app_secondary;
  var other_app_total_hrs = ((other_app_percent_of / 100) * total_hrs_for_single);  // for single app secondary
  console.log('other_app_total_hrs -----> '+other_app_total_hrs);
  var grandTotalCost = 0;
  var other_app_sel = 0;
  // if (sel_other_apps && sel_other_apps.includes("primary_app") == true) {
  //   app_primary = 1;
  // }
  // if (sel_other_apps && sel_other_apps.includes("Secondary_app") == true) {
  //   app_secondary = 1;
  // }
  other_app_sel = app_primary + app_secondary;
  var other_app_efrts = other_app_sel * other_app_total_hrs;
  console.log('other_app_efrts ------> '+other_app_efrts);
  // var hours_cnt_total = uiscreenhrs + parseFloat(frontend_total_hrs) + backend_hrs + parseFloat(other_app_total_hrs);
  var hours_cnt_total = uiscreenhrs + parseFloat(frontend_total_hrs) + backend_hrs + parseFloat(other_app_efrts);
  grandTotalCost = parseFloat(hours_cnt_total * 10);

  var timeLineInWeek = parseFloat(workingEfforts / 40);
  var timeLineInMonth = parseFloat(timeLineInWeek / 4);

  let amt_convertd = 0;
  let currency_rate_value = 0;

  // perform currency conversion
  const geo_data = await getGeoDetails(remote_ip);
  const conversion_data = await getConversionDetails(geo_data.currency_name, grandTotalCost);
  amt_convertd = conversion_data.converted_amt;
  currency_rate_value = conversion_data.currency_rate;
  var result = {
    status: "Success",
    UPF: UPF,
    CAF: CAF,
    workingEfforts: workingEfforts,  // ok
    uiscreenhrs: uiscreenhrs,  // ok
    TotalEffortCntAndriodApp:TotalEffortCntAndriodApp,
    TotalEffortCntIOSApp:TotalEffortCntIOSApp,
    TotalEffortCntwebApp:TotalEffortCntwebApp,
    frontend_total_hrs: frontend_total_hrs,  // ok
    backend_hrs: backend_hrs,  // ok
    other_app_efrts: other_app_efrts,
    totalHrs: Math.round(hours_cnt_total)+ ' HRS',
    totalCost: Math.round(amt_convertd)+' '+conversion_data.currency_name,
    // totalCost: grandTotalCost.toFixed(2),
    timeLineInWeek: timeLineInWeek.toFixed(2),
    timeLineInMonth: timeLineInMonth.toFixed(2),
    domanComplexityValue: domanComplexityValue,
    currencyRateVal:Math.round(currency_rate_value)
  }

  //},500)

  return result;
}

const findAppCost = async (remote_ip, request_from, primary_app_estimation, secondary_app_estimation, admin_panel_estimation, tertiary_app_estimation,non_functional_estimation) => {
  var grandTotalCost = 0;
  var uiscreenhrs = 150;  // fixed
  let workingEfforts = parseFloat(uiscreenhrs) + parseFloat(primary_app_estimation) + parseFloat(secondary_app_estimation) + parseFloat(admin_panel_estimation) + parseFloat(tertiary_app_estimation) + parseFloat(non_functional_estimation); // sum of all estimation
  grandTotalCost = parseFloat(workingEfforts * 10);
  console.log("workingEfforts ----->"+workingEfforts);
  var timeLineInWeek = parseFloat(workingEfforts / 40);
  var timeLineInMonth = parseFloat(timeLineInWeek / 4);

  let amt_convertd = 0;
  let currency_rate_value = 0;

  // perform currency conversion
  const geo_data = await getGeoDetails(remote_ip);
  const conversion_data = await getConversionDetails(geo_data.currency_name, grandTotalCost);
  console.log("remote_ip",remote_ip);
  console.log("geo_data",geo_data);
  console.log("conversion_data",conversion_data);
  amt_convertd = conversion_data.converted_amt;
  currency_rate_value = conversion_data.currency_rate;
  var result = {
    status: "Success",
    totalHrs: Math.round(workingEfforts)+ ' HRS',
    totalCost: Math.round(amt_convertd).toLocaleString()+' '+conversion_data.currency_name,
    timeLineInWeek: timeLineInWeek.toFixed(2),
    timeLineInMonth: timeLineInMonth.toFixed(2),
    currencyRateVal:Math.round(currency_rate_value)
  }
  return result; 
}

const getGeoDetails = async (remote_ip) => {
  // do something asynchronously and return a promise
  let currency_val = '';
  // let IPAPI_ACCESS_KEY = 'b17b85c27f0ac8e619af791922cd25ec';
  // let IPAPI_ACCESS_KEY = '5963dad930f9665fa32b0d71eb802b10';
  let IPSTACK_ACCESS_KEY='b9e2ec5c244e68f3af7f06a876cd5f36';
  let converted_amt = 0;
  let res_str = '';
  let country_name = '';
  let currency_name = '';
  let city_name = '';
  let flag_code = '';
  let flag_url = '';
  var options = {
    'method': 'GET',
    'url': 'http://api.ipstack.com/'+remote_ip+'?access_key='+IPSTACK_ACCESS_KEY+'',
  };
   request(options, function (error, response) {
    if (error) throw new Error(error);
    res_str = JSON.parse(response.body);    // json result
    console.log("response.body",response.body);
    if(res_str.success == false){
      country_name = 'Not Available';
      currency_name = 'USD';
      city_name = 'Not Available';
      flag_code = 'Not Available';
      flag_url = ''
    } else{ 
      country_name = res_str.country_name;
      currency_name = res_str.currency.code;
      city_name = res_str.city;
      flag_code = res_str.country_code;
      flag_url = res_str.location.country_flag;
    }
  });

  await sleep(900);
    var output_arr = {
      country_name:country_name,
      city_name:city_name,
      currency_name:currency_name,
      flag_code:flag_code,
      flag_url:flag_url
    }
    return output_arr;
}

const getConversionDetails = async (currency_to, base_amount_to_convert) => {
  var converted_amt_res = {};
  var API_ACCESS_KEY = 'rwFiRGcAzypheLnJkeGtc7Eg1GEKEQpg';
    var currency_from = 'USD';
    let converted_amt = 0;
    let currency_rate = 1;
    console.log('base_amount_to_convert --->'+base_amount_to_convert);
    var api_for_convert = 'https://api.apilayer.com/fixer/convert?apikey='+API_ACCESS_KEY+'&from='+currency_from+'&to='+currency_to+'&amount='+base_amount_to_convert+'';
    try {
      var get_currency_result = await fetchGetMethod_forCurrency(api_for_convert);

      if(get_currency_result.success == true){
          console.log('in if on success');
          converted_amt = get_currency_result.result
          console.log('converted_amt ---> '+converted_amt);
          converted_amt_res = {
            converted_amt:converted_amt,
            currency_name:currency_to,
            currency_rate:get_currency_result.info.rate,
          }
        } else{
          console.log('in else on failure');
          converted_amt_res = {
            converted_amt:base_amount_to_convert,
            currency_rate:currency_rate,
            currency_name:currency_from,
          }
        }
        return converted_amt_res;
    } catch (error) {
      converted_amt_res = {
        converted_amt:base_amount_to_convert,
        currency_rate:currency_rate,
        currency_name:currency_from,
      }
      console.log(error.message)
      return converted_amt_res
    }
    // var get_currency_result = await fetchGetMethod_forCurrency(api_for_convert);
    // console.log(get_currency_result);
    // if(get_currency_result.success == true){
    //   console.log('in if on success');
    //   converted_amt = get_currency_result.result
    //   console.log('converted_amt ---> '+converted_amt);
    //   converted_amt_res = {
    //     converted_amt:converted_amt,
    //     currency_name:currency_to,
    //     currency_rate:get_currency_result.info.rate,
    //   }
    // } else{
    //   console.log('in else on failure');
    //   converted_amt_res = {
    //     converted_amt:base_amount_to_convert,
    //     currency_rate:currency_rate,
    //     currency_name:currency_from,
    //   }
    // }
    // return converted_amt_res;
}

//functional Unit
const getUnitValues = () => {
  var unitValues = [
    {
      unit: "user-inputs-ei",
      factor: "simple",
      // value: 2
      value: 2
    },
    {
      unit: "user-inputs-ei",
      factor: "average",
      // value: 3
      value: 2
    },
    {
      unit: "user-inputs-ei",
      factor: "high",
      // value: 3
      value: 2
    },
    {
      unit: "user-outputs-eo",
      factor: "simple",
      // value: 1
      value: 2
    },
    {
      unit: "user-outputs-eo",
      factor: "average",
      // value: 2
      value: 2
    },
    {
      unit: "user-outputs-eo",
      factor: "high",
      // value: 3
      value: 2
    },
    {
      unit: "user-inquiries-eq",
      factor: "simple",
      // value: 2
      value: 2
    },
    {
      unit: "user-inquiries-eq",
      factor: "average",
      // value: 4
      value: 2
    },
    {
      unit: "user-inquiries-eq",
      factor: "high",
      // value: 5
      value: 2
    },
    {
      unit: "hardware-integrations-hi",
      factor: "simple",
      // value: 5
      value: 10
    },
    {
      unit: "hardware-integrations-hi",
      factor: "average",
      // value: 7
      value: 15
    },
    {
      unit: "hardware-integrations-hi",
      factor: "high",
      // value: 8
      value: 20
    },
    {
      unit: "3rd-party-api-integrations-si",
      factor: "simple",
      // value: 5
      value: 3
    },
    {
      unit: "3rd-party-api-integrations-si",
      factor: "average",
      // value: 7
      value: 3
    },
    {
      unit: "3rd-party-api-integrations-si",
      factor: "high",
      // value: 8
      value: 15
    }
  ];

  return unitValues;
}

const getUnitValuesForApp = () => {
  var unitValues = [
    {
      unit: "EI",
      factor: "simple",
      // value: 2
      value: 2
    },
    {
      unit: "EI",
      factor: "average",
      // value: 3
      value: 2
    },
    {
      unit: "EI",
      factor: "high",
      // value: 3
      value: 2
    },
    {
      unit: "EO",
      factor: "simple",
      // value: 1
      value: 2
    },
    {
      unit: "EO",
      factor: "average",
      // value: 2
      value: 2
    },
    {
      unit: "EO",
      factor: "high",
      // value: 3
      value: 2
    },
    {
      unit: "EQ",
      factor: "simple",
      // value: 2
      value: 2
    },
    {
      unit: "EQ",
      factor: "average",
      // value: 4
      value: 2
    },
    {
      unit: "EQ",
      factor: "high",
      // value: 5
      value: 2
    },
    {
      unit: "HI",
      factor: "simple",
      // value: 5
      value: 10
    },
    {
      unit: "HI",
      factor: "average",
      // value: 7
      value: 15
    },
    {
      unit: "HI",
      factor: "high",
      // value: 8
      value: 20
    },
    {
      unit: "SI",
      factor: "simple",
      // value: 5
      value: 3
    },
    {
      unit: "SI",
      factor: "average",
      // value: 7
      value: 3
    },
    {
      unit: "SI",
      factor: "high",
      // value: 8
      value: 15
    }
  ];

  return unitValues;
}

const getdomainComplexityValue = async () => {
  var dcv = [
    {
      d_name: "Accounting",
      d_slug: "accounting",
      value: 3
    },
    {
      d_name: "Booking Apps (Hotel, Flight, Taxi, etc.)",
      d_slug: "booking",
      value: 1
      // value: 3
      // value: 5
    },
    {
      d_name: "E-Commerce / Shopping Apps",
      d_slug: "e-commerce-shopping-apps",
      value: 1
      // value: 3
      // value: 5
    },
    {
      d_name: "Education and E-Learning",
      d_slug: "education-and-e-learning",
      value: 1
      // value: 3
      // value: 6
    },
    {
      d_name: "Food Delivery",
      d_slug: "food-delivery",
      value: 1,
      // value: 3,
      // value: 5
    },
    {
      d_name: "IOT",
      d_slug: "iot",
      value: 3
      // value: 5
      // value: 7
    },
    {
      d_name: "Lifestyle / Health and Fitness",
      d_slug: "lifestyle-health-and-fitness",
      value: 1
      // value: 3
      // value: 4
    },
    {
      d_name: "NGO & Fundraising",
      d_slug: "ngo-fundraising",
      value: 1
      // value: 3
      // value: 4
    },
    {
      d_name: "Productivity",
      d_slug: "productivity",
      value: 1
      // value: 3
      // value: 5
    },
    {
      d_name: "Real Estate",
      d_slug: "real-estate",
      value: 1
      // value: 3
      // value: 5
    },
    {
      d_name: "Service Apps (eg.UrbanClap)",
      d_slug: "service-apps-eg-urbanclap",
      value: 1
      // value: 3
      // value: 6
    },
    {
      d_name: "Social Networking / Social Media Sharing",
      d_slug: "social-networking-social-media-sharing",
      value: 1
      // value: 3
      // value: 6
    },
    {
      d_name: "Transport & Logistics Management",
      d_slug: "transport-logistics-management",
      value: 1
      // value: 4
      // value: 6
    },
    {
      d_name: "Travel Booking",
      d_slug: "travel-booking",
      value: 1
      // value: 4
      // value: 6
      
    }
  ];
  return dcv;

}

const fetchGetMethod = async (apiFunction) => {
  var apiUrl = configModel.API_URL + apiFunction;
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data;
}

const fetchPostMethod = async (url, jsonData) => {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(jsonData),
    headers: { 'Content-Type': 'application/json' }
  })
  // console.log(response);
  const data = await response.json();
  return data;
}

const saveContactUser = async (data) => {
  var user_name = data.user_name;
  var user_email = data.user_email;
  var user_contact = data.user_contact;
  var user_message = data.user_message;
  var contactmeOptions = data.contactmeOptions;
  var is_mail = 0;
  var is_mobile = 0;
  var is_whatsapp = 0;
  var is_dnd = 0;
  if (contactmeOptions == 'email') {
    is_mail = 1;
  }

  if (contactmeOptions == 'phone') {
    is_mobile = 1;
  }

  if (contactmeOptions == 'whatsapp') {
    is_whatsapp = 1;
  }

  if (contactmeOptions == 'dnd') {
    is_dnd = 1;
  }

  if (contactmeOptions == 'all') {
    is_whatsapp = 1;
    is_mobile = 1;
    is_mail = 1;
  }

  var sqlquery = 'INSERT INTO users (user_name, email, contact_no, message, is_mail, is_mobile, is_whatsapp, is_dnd) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  var params = [user_name, user_email, user_contact, user_message, is_mail, is_mobile, is_whatsapp, is_dnd];
  var rows = await db.dbQuery(sqlquery, params);
  console.log(rows);
  if (rows.affectedRows == 1) {
    return { status: true, user_id: rows.insertId };
  } else {
    return { status: false };
  }

  // return { status: true, user_id: 355 };

}


const getAllCostEstimation = async (data, user_id, remote_ip,origin, mail_sender,mail_subject,mail_attachment_name) => {
  console.log('getAllCostEstimation() called');
  var step2_platform_data = data.step2_platform_data;
  var step3_feature_data = data.step3_feature_data;
  var step4_NonFunctional_data = data.step4_NonFunctional_data;
  var adminPanel_data = data.AdminPanel_data;
  var other_apps = data.OtherAppData;
  var step1_domain_data = data.step1_domain_data;
  var workingEfforts = data.workingEfforts;
  var selectedFeatures = data.selected_features;
  var selectedDomainSlug = data.selected_domain_slug;

  let modular_features_arr = await fetchGetMethod('modular_features?sel_domain=' + selectedDomainSlug + '');
  console.log("modular_features_arr appcost-uk --->",modular_features_arr)
  let module_arr_raw = modular_features_arr.modular_feature;
  let module_arr = Object.keys(module_arr_raw);

  var modular_list = {};
  // prepare modular list full
  let modular_list_full = "";
  // START LOOPING
  for (const module_title of module_arr) {
      var result = {};
      let feature_list_basic_arr = [];
      let feature_list_advance_arr = [];

      let list_basic = [];
      let list_advance = [];

      let name_basic = [];
      let name_advance = [];

      // handle if basic list or advance list not available
          list_basic = modular_features_arr.modular_feature[module_title].basic_list;
          name_basic = list_basic.features;
          for (let j in name_basic) { // prepare basic list
              for (let k in selectedFeatures) { 
                  if(name_basic[j] == selectedFeatures[k].feature){
                      feature_list_basic_arr.push(selectedFeatures[k].feature);
                  } 
              }
          }
          result = feature_list_basic_arr
          list_advance = modular_features_arr.modular_feature[module_title].advance_list;
          name_advance = list_advance.features;
          for (let j in name_advance) { // prepare advance list
              for (let k in selectedFeatures) { 
                  if(name_advance[j] == selectedFeatures[k].feature){
                      feature_list_advance_arr.push(selectedFeatures[k].feature);
                  }
              }
          }
          result = feature_list_advance_arr
          let combined_arr = feature_list_basic_arr.concat(feature_list_advance_arr)
          if(combined_arr.length != 0){
            modular_list[module_title] = combined_arr
          }
  }

  console.log("modular_list appcost-uk-->",modular_list)
  // END LOOPING
let modl_list1 = Object.keys(modular_list);
modl_list1.map(item =>{ 
  modular_list_full += '<li>'+item;
  modular_list_full += '<ul>';
    modular_list[item].map(feature =>{
      modular_list_full += '<li>'+feature+'</li>';
    })
    modular_list_full += '</ul>';
    modular_list_full += '</li>'
  })

  const allUnits = await getFeatureUnits();
  var factorSumArray = [];
  allUnits.forEach(value => {
    var sumOfEachunit = findSumOfEachUnit(selectedFeatures, value);
    factorSumArray.push(sumOfEachunit);
  })

  var UPF = factorSumArray.reduce((a, b) => a + b, 0);
  var complexityValues = await getdomainComplexityValue();
  const complexity_val = complexityValues.filter(function (e) { return e.d_slug == selectedDomainSlug }).map(ele => ele.value);
  var domanComplexityValue = 0;
  if (complexity_val.length != 0) {
    domanComplexityValue = complexity_val[0];
  } else {
    domanComplexityValue = 0
  }
  var CAF = parseFloat(0.65 + (0.01 * domanComplexityValue)).toFixed(2);  // Complexity Adjustment 
  var functionalPoint = parseFloat(UPF * CAF).toFixed(2);
  var functionalFeature_cnt = parseFloat(functionalPoint * 8);//8 is total working hours in a day
  var uiscreenhrs = 150;  // fixed
  var source_and_medium_url = data.screenDesignStatus == null ? '' : data.screenDesignStatus;  // getting utm source and medium value
  // note: to avoid mobile app crashing, re-used screenDesignStatus key to get this value. change it in next mobile version update
  var app_primary = 0; var app_secondary = 0;
  var total_apps = 1;   // 1 for main app compulsory (other app selection is not needed)
  // get count for other apps selected 
  if (other_apps && other_apps.includes("primary_app") == true) {
    app_primary = 1;
  }
  if (other_apps && other_apps.includes("Secondary_app") == true) {
    app_secondary = 1;
  }
  total_apps = parseInt(total_apps) + parseInt(app_primary) + parseInt(app_secondary);
  var non_functional_fts_hrs = 100;   // 100 for non_functional_fts_hrs is fixed
  var percent_of = 60;    // for web platform
  var other_app_percent_of = 40;  // for other app
  var fn_nfn_hrs_total = parseFloat(functionalFeature_cnt + non_functional_fts_hrs);
  let total_hrs_for_single = functionalFeature_cnt;
  var frontend_android_hrs = 0; var frontend_ios_hrs = 0; var frontend_web_hrs = 0;
  var frontend_total_hrs = 0;
  var selectedTechnology = (data.selectedTechnology == undefined) ? 'native' : data.selectedTechnology; //fixed
  var total_platform = 0;
  var total_app = 1;    // 1 for main app compulsory (other app selection is not needed)
  var dis_platform = '';
  var android = 0;
  var ios = 0;
  var web = 0;
  var frontendPlatForms = [];

  if (step2_platform_data.includes("Android")) {
    android = 1;
    frontend_android_hrs = total_hrs_for_single;
    frontend_total_hrs = frontend_android_hrs + frontend_ios_hrs + frontend_web_hrs;
    var pltFrm = {
      title: "Android",
      hours: frontend_android_hrs.toFixed(2)
    }
    frontendPlatForms.push(pltFrm);
  } else {
    var pltFrm = {
      title: "Android",
      hours: frontend_android_hrs
    }
    frontendPlatForms.push(pltFrm);
  }

  if (step2_platform_data.includes("iOS")) {
    ios = 1;
    frontend_ios_hrs = total_hrs_for_single;
    frontend_total_hrs = frontend_android_hrs + frontend_ios_hrs + frontend_web_hrs;
    var pltFrm = {
      title: "iOS",
      hours: frontend_ios_hrs.toFixed(2)
    }
    frontendPlatForms.push(pltFrm);
  } else {
    var pltFrm = {
      title: "iOS",
      hours: frontend_ios_hrs
    }
    frontendPlatForms.push(pltFrm);
  }

  if (step2_platform_data.includes("Web")) {
    web = 1;
    frontend_web_hrs = ((percent_of / 100) * total_hrs_for_single);
    frontend_total_hrs = frontend_android_hrs + frontend_ios_hrs + frontend_web_hrs;
    var pltFrm = {
      title: "Web",
      hours: frontend_web_hrs.toFixed(2)
    }
    frontendPlatForms.push(pltFrm);
  } else {
    var pltFrm = {
      title: "Web",
      hours: frontend_web_hrs
    }
    frontendPlatForms.push(pltFrm);
  }
  total_platform = parseInt(android) + parseInt(ios) + parseInt(web);
  dis_platform = step2_platform_data.join(', ');

  // collect list of features
  var functionalFeatures = step3_feature_data.basic_feature.join(', ');
  functionalFeatures += step3_feature_data.advance_feature.join(', ');
  var nonFunctionalFeatures = step4_NonFunctional_data.Basic_feature.join(', ');
  nonFunctionalFeatures += step4_NonFunctional_data.Advance_feature.join(', ');
  var adminPanelFeatures = adminPanel_data.Basic_feature.join(', ');
  adminPanelFeatures += adminPanel_data.Advance_feature.join(', ');

  // collect feature list seperately
  var functionalFeaturesBasic = step3_feature_data.basic_feature.join(', ');
  var functionalFeaturesAdvance = step3_feature_data.advance_feature.join(', ');
  var nonFunctionalFeaturesBasic = step4_NonFunctional_data.Basic_feature.join(', ');
  var nonFunctionalFeaturesAdvance = step4_NonFunctional_data.Advance_feature.join(', ');
  var adminPanelFeaturesBasic = adminPanel_data.Basic_feature.join(', ');
  var adminPanelFeaturesAdvance = adminPanel_data.Advance_feature.join(', ');

  // set functional features - basic list
  var functional_list_basic = "";
  let fnb_list = step3_feature_data.basic_feature
  fnb_list.map(item => {
    functional_list_basic += "<li>"+item+"</li>"
  } )

  // set functional features - advance list
  var functional_list_advance = "";
  let fnad_list = step3_feature_data.advance_feature
  fnad_list.map(item => {
    functional_list_advance += '<li>'+item+'</li>'
  } )

  // set non-functional features - basic list
  var nonfunctional_list_basic = "";
  let nfnb_list = step4_NonFunctional_data.Basic_feature
  nfnb_list.map(item => {
    nonfunctional_list_basic += '<li>'+item+'</li>'
  } )

  // set non-functional features - advance list
  var nonfunctional_list_advance = "";
  let nfnad_list = step4_NonFunctional_data.Advance_feature
  nfnad_list.map(item => {
    nonfunctional_list_advance += '<li>'+item+'</li>'
  } )

  // set admin-panel features - basic list
  var adminpanel_list_basic = "";
  let admb_list = adminPanel_data.Basic_feature
  admb_list.map(item => {
    adminpanel_list_basic += '<li>'+item+'</li>'
  } )

  // set admin-panel features - advance list
  var adminpanel_list_advance = "";
  let admad_list = adminPanel_data.Advance_feature
  admad_list.map(item => {
    adminpanel_list_advance += '<li>'+item+'</li>'
  } ) 

  // get proper label for other apps selected based on domain
  var vendor_app = 0;
  var delivery_app = 0;
  // get count for other apps selected 
  if (other_apps && other_apps.includes("primary_app") == true) {
    app_primary = 1;
    vendor_app = 1;
  }
  if (other_apps && other_apps.includes("Secondary_app") == true) {
    app_secondary = 1;
    delivery_app = 1;
  }
  var total_apps_sel = parseInt(total_app) + parseInt(app_primary) + parseInt(app_secondary);

  // fixed values
  var webServiceHrs = 20;
  var adminPanelHrs = 100;
  var databaseHrs = 10;

  // calculate hours for backend
  var webservices_hrs = webServiceHrs * total_platform;
  var database_hrs = databaseHrs * total_apps_sel;
  var admin_panel_hrs = adminPanelHrs * total_apps_sel;
  var backend_hrs = webservices_hrs + database_hrs + admin_panel_hrs;

  var backendPlatforms = [
    {
      title: "Web Service",
      hours: webservices_hrs.toFixed(2)
    },
    {
      title: "Admin Panal",
      hours: admin_panel_hrs.toFixed(2)
    },
    {
      title: "Database",
      hours: database_hrs.toFixed(2)
    }
  ];

  // calculate hours for secondary apps
  var other_app_only = 0;
  var primary_app_name = '';
  var secondary_app_name = '';
  var primary_app_efforts = 0;
  var secondary_app_efforts = 0;
  var other_app_icon1 = '';
  var other_app_icon2 = '';
  other_app_only = app_primary + app_secondary;
  var TotalHrs_fnf = functionalFeature_cnt + non_functional_fts_hrs;
  var total_hrs_for_single_app = (TotalHrs_fnf + (adminPanelHrs + webServiceHrs + databaseHrs) + uiscreenhrs);
  var other_app_total_hrs = ((other_app_percent_of / 100) * total_hrs_for_single);
  //set other app name based  on domain
  if (selectedDomainSlug == 'booking-apps-hotel-flight-taxi-etc') {
    primary_app_name = 'Vendor App';
    secondary_app_name = 'Delivery App';
    other_app_icon1 = 'fa fa-store';
    other_app_icon2 = 'fa fa-truck';
  } else if (selectedDomainSlug == 'e-commerce-shopping-apps') {
    primary_app_name = 'Vendor App';
    secondary_app_name = 'Delivery App';
    other_app_icon1 = 'fa fa-store';
    other_app_icon2 = 'fa fa-truck';
  } else if (selectedDomainSlug == 'education-and-e-learning') {
    primary_app_name = 'Student App';
    secondary_app_name = 'Teacher App';
    other_app_icon1 = 'fa fa-user-graduate';
    other_app_icon2 = 'fas fa-chalkboard-teacher';
  } else if (selectedDomainSlug == 'food-delivery') {
    primary_app_name = 'Vendor App';
    secondary_app_name = 'Delivery App';
    other_app_icon1 = 'fa fa-store';
    other_app_icon2 = 'fa fa-truck';
  } else if (selectedDomainSlug == 'iot') {
    primary_app_name = '';
    secondary_app_name = '';
    other_app_icon1 = '';
    other_app_icon2 = '';
  } else if (selectedDomainSlug == 'lifestyle-health-and-fitness') {
    primary_app_name = 'Coach App';
    secondary_app_name = 'Manager App';
    other_app_icon1 = 'fa fa-user-tie';
    other_app_icon2 = 'fa fa-user';
  } else if (selectedDomainSlug == 'ngo-fundraising') {
    primary_app_name = 'Manager App';
    secondary_app_name = 'Organizer App';
    other_app_icon1 = 'fa fa-user-tie';
    other_app_icon2 = 'fa fa-user';
  } else if (selectedDomainSlug == 'productivity') {
    primary_app_name = '';
    secondary_app_name = '';
    other_app_icon1 = '';
    other_app_icon2 = '';
  } else if (selectedDomainSlug == 'real-estate') {
    primary_app_name = 'Broker App';
    secondary_app_name = 'Manager App';
    other_app_icon1 = 'fas fa-user';
    other_app_icon2 = 'fa fa-user-tie';
  } else if (selectedDomainSlug == 'service-apps-eg-urbanclap') {
    primary_app_name = 'Vendor App';
    secondary_app_name = 'Delivery App';
    other_app_icon1 = 'fa fa-store';
    other_app_icon2 = 'fa fa-truck';
  } else if (selectedDomainSlug == 'social-networking-social-media-sharing') {
    primary_app_name = 'Merchant App';
    secondary_app_name = '';
    other_app_icon1 = 'far fa-store';
    other_app_icon2 = '';
  } else if (selectedDomainSlug == 'transport-logistics-management') {
    primary_app_name = 'Driver App';
    secondary_app_name = 'Transporter App';
    other_app_icon1 = 'fa-solid fa-steering-wheel';
    other_app_icon2 = 'fa fa-truck';
  }
  let secondaryAppPlatforms = [];
  var app_primary_cost = 0; var app_secondary_cost = 0;
  if (other_apps && other_apps.includes("primary_app")) {
    // primary_app_efforts = other_app_total_hrs / 2;
    primary_app_efforts = (other_apps.length >= 1)?other_app_total_hrs:other_app_total_hrs*2;
    var pltFrm = {
      title: primary_app_name,
      app_icon: other_app_icon1,
      hours: Math.round(primary_app_efforts)
    }
    // primary_app_efforts = other_app_total_hrs.toFixed(2);
    app_primary_cost = (primary_app_efforts.toFixed(2) * 10)
    secondaryAppPlatforms.push(pltFrm);
  } else {
    var pltFrm = {
      title: primary_app_name,
      app_icon: other_app_icon2,
      hours: 0
    }
    primary_app_efforts = 0;
    secondaryAppPlatforms.push(pltFrm);
  }

  if (other_apps && other_apps.includes("Secondary_app")) {
    // secondary_app_efforts = other_app_total_hrs / 2;
    secondary_app_efforts = (other_apps.length >= 1)?other_app_total_hrs:other_app_total_hrs*2;
    var pltFrm = {
      title: secondary_app_name,
      app_icon: other_app_icon1,
      hours: Math.round(secondary_app_efforts)
    }
    
    app_secondary_cost = (secondary_app_efforts.toFixed(2) * 10)
    secondaryAppPlatforms.push(pltFrm);
  } else {
    var pltFrm = {
      title: secondary_app_name,
      app_icon: other_app_icon2,
      hours: 0
    }
    secondary_app_efforts = 0;
    secondaryAppPlatforms.push(pltFrm);
  }

  var secondaryAppHrs = other_apps.length * other_app_total_hrs;
  var grandTotalEfforts = 0;
  var test_var_total = 0
  test_var_total = uiscreenhrs + frontend_total_hrs + backend_hrs + secondaryAppHrs;
  grandTotalEfforts = parseFloat(uiscreenhrs + frontend_total_hrs + backend_hrs + secondaryAppHrs);
  var grandTotalCost = 0;

  let amt_convertd = 0;
  let currency_rate_value = 0;

  if (selectedTechnology == "native") {
    grandTotalCost = parseFloat(grandTotalEfforts * 10);
  } else if (selectedTechnology == "Cross-Platform") {
    grandTotalCost = parseFloat(((grandTotalEfforts * 10) * 30) / 100);   // of 30% val
  }

  // perform currency conversion
  const geo_data = await getGeoDetails(remote_ip);
  const conversion_data = await getConversionDetails(geo_data.currency_name, grandTotalCost);
  amt_convertd = conversion_data.converted_amt;
  currency_rate_value = conversion_data.currency_rate;
  // ========================================================
  var timeline_val = grandTotalEfforts / 730;   // 730 hrs for a month
  var dt = datetime.create();
  var sqlquery = 'INSERT INTO app_cost_calculator (user_id, domain_id, is_android, is_ios, is_web, functional_features, non_functional_features, admin_features, ff_basic_list, ff_advance_list, nff_basic_list, nff_advance_list, adm_basic_list, adm_advance_list, frontend_efforts, android_efforts, ios_efforts, web_efforts, db_efforts,	webservices_efforts, adm_panel_efforts, backend_efforts, secondaryapp_efforts, other_app_names, total_cost, total_efforts, is_vendor_app,	is_delivery_app ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )';
  var params = [user_id, step1_domain_data, android, ios, web, functionalFeatures, nonFunctionalFeatures, adminPanelFeatures, functionalFeaturesBasic, functionalFeaturesAdvance, nonFunctionalFeaturesBasic, nonFunctionalFeaturesAdvance, adminPanelFeaturesBasic, adminPanelFeaturesAdvance, Math.round(frontend_total_hrs), Math.round(frontend_android_hrs), Math.round(frontend_ios_hrs), Math.round(frontend_web_hrs), Math.round(database_hrs), webservices_hrs, admin_panel_hrs, backend_hrs, Math.round(secondaryAppHrs), primary_app_name+', '+secondary_app_name, Math.round(amt_convertd), grandTotalEfforts, app_primary, app_secondary ];
  var rows = await db.dbQuery(sqlquery, params);
  // send email on successful submission to user
  console.log('go with pdf');
  // functionality working with sendgrid
  let web_application = (web == 1) ? 'Yes' : 'No'
  let customer_mail_template_version_red = `<!DOCTYPE html>
  <html lang="en">
    <head>
    </head>
    <body
      style="font-family: Overpass, sans-serif;box-sizing: border-box;padding: 0;margin:0;">
      <div class="main-container" style="padding:50px;padding-top:0px">
        <div>
          <div>
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/3acd8747-2022-48cf-99d8-fa02223bcfe8/707x216.png" alt="Creating Email Magic" width="150"/>
            <img src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/1fc7dc6b-b558-40fa-b995-2447bd6cb449/282x90.png" alt="Creating Email Magic" style="float: right" height="75" />
          </div>
        </div>
  
        <div class="pg-title" style="text-align: right">
          <h2>MOBILE APP COST CALCULATOR</h2>
        </div>
  
        <div style="border-top: 2px solid #F20101"></div>
        <div style="text-align: center">
          <img src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f37d2286-0b6f-4f40-bf55-5602c0ce53cc/852x508.png" style="width: 550px; margin-top: 20px" alt="image" />
        </div>
  
        <div style="margin-top: 20px; border-bottom: 1px solid #eeeeee">
          <h2 class="heading" style="text-align: center; color: #F20101">
            Greetings!
          </h2>
          <p style="font-size: 14px;line-height: 25px;padding: 1px 20px;font-weight: 600;">
            Dear ${data.user_name},
          </p>
          <p style="font-size: 14px;line-height: 25px;padding: 1px 20px;font-weight: 500;">
            Thank you for trusting us to help you find a solution. Please find
            below a high-level Effort and Cost estimation based on your
            preferences.
          </p>
        </div>
  
        <div style="border-bottom: 2px solid #eeeeee">
          <h2 style="text-align: center;margin: 20px 0;font-size: 20px;font-weight: 600;">
            Application Specifications
          </h2>
        </div>
  
        <div style="border-bottom: 1px solid #eeeeee">
          <table
            width="100%"
            cell-spacing="0"
            cell-padding="0"
            border-collapse:collapse;>
            <thead>
              <tr style="background-color: #F20101; color: #ffffff">
                <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                  App Specifications
                </th>
                <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                  User Preferences
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align: center; padding: 10px">
                  Application Category
                </td>
                <td style="text-align: center; padding: 10px">${data.step1_domain_data}</td>
              </tr>
              <tr>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">
                  Platforms Selected
                </td>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">${dis_platform}</td>
              </tr>
              <tr>
                <td style="text-align: center; padding: 10px">Admin Panel</td>
                <td style="text-align: center; padding: 10px">Yes</td>
              </tr>
              <tr>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">
                  Web Application
                </td>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">
                ${web_application}
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding: 10px">Secondary App</td>
                <td style="text-align: center; padding: 10px">
                ${primary_app_name} ${secondary_app_name}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <div style="border-bottom: 2px solid #eeeeee">
          <h2 style="text-align: center;margin: 20px;font-size: 20px;font-weight: 600;">
            App Version Specifications
          </h2>
        </div>
        <div style="border-bottom: 1px solid #eeeeee">
          <table
            width="100%"
            cell-spacing="0"
            cell-padding="0"
            border-collapse:collapse;>
            <thead>
              <tr style="background-color: #F20101; color: #ffffff">
                <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                  App Version Specifications
                </th>
                <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                  Android
                </th>
                <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                  iOS
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align: center; padding: 10px">Latest Version</td>
                <td style="text-align: center; padding: 10px">11.0</td>
                <td style="text-align: center; padding: 10px">14</td>
              </tr>
              <tr>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">
                  Backward Compatibility
                </td>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">
                  6.0
                </td>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">
                  12
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding: 10px">Screen Sizes</td>
                <td style="text-align: center; padding: 10px">5.0 -> 6.9</td>
                <td style="text-align: center; padding: 10px">4.7 -> 6.5</td>
              </tr>
              <tr>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">
                  Minimum SDK Version
                </td>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">
                  Marshmallow - Version-6
                  <br />API Level -23
                </td>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">
                  -
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding: 10px">
                  Maximum SDK Version
                </td>
                <td style="text-align: center; padding: 10px">
                  Android 11 - Version-11 <br />
                  API Level -30
                </td>
                <td style="text-align: center; padding: 10px">-</td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <div style="background-color: #f7f7f7;padding: 30px;margin-top: 20px;text-align: center;">
          <h4 style="font-weight: bold;margin-top: 0;font-size: 24px;margin-bottom: 5px;">
            Grand Cost
          </h4>
          <h2 style="margin-top: 0;margin-bottom: 5px;color: #F20101;font-size: 30px;letter-spacing: 3px;font-weight: 400;">
            ${Math.round(amt_convertd)} ${conversion_data.currency_name}
          </h2>
          <p style="margin-top: 0; margin-bottom: 30px">
            If this is a bit unexpected, we are keen to help you to reduce this cost, Please answer few more questions.
          </p>
          <div style="text-align: center">
            <div style="height: 56px;line-height: 56px;border: 2px solid #F20101;background: #f7f7f7;">
              <span class="cx-ttext" style="font-weight: 600; display: block; font-size: 20px">TIMELINE ${Math.round(timeline_val)} Months (approx.)</span>
            </div>
          </div>
        </div>
  
        <div style="text-align: center;font-size: 20px;font-weight: bold;padding-top: 20px;padding-bottom: 20px;">
          Cost Breakups
        </div>
  
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;">
          <div style="padding: 25px">
            <div style="width: 10%; float: left">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/92bfbb0a-831d-455a-856f-7de0bb1d36d8/32x32.png"
              />
            </div>
            <div style="width: 90%; float: right">
              <div style="font-size: 20px; font-weight: bold">${data.step1_domain_data}</div>
              <div style="font-size: 12px; color: #F20101; font-weight: bold">
              ${Math.round(grandTotalEfforts)} Hours
              </div>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 20px; display: flex">
          <div style="width: 20%">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f022be81-8d7d-40b6-92e7-598b62c8fa53/30x30.png"
              style="padding-left: 25px; margin-top: 25px"
            />
          </div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
            <div style="padding: 25px; display: flex" width="100%">
              <div style="width: 10%">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/14c989c2-5bb2-40a3-bc23-d621edb508db/24x24.png"
                  style="margin-top: 10px"
                />
              </div>
  
              <div style="width: 90%">
                <div style="font-size: 20px; font-weight: bold">
                  Screen Design
                </div>
                <div style="font-size: 12px; color: #F20101; font-weight: bold">
                ${uiscreenhrs} hrs
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 20px; display: flex">
          <div style="width: 20%">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f022be81-8d7d-40b6-92e7-598b62c8fa53/30x30.png"
              style="padding-left: 25px; margin-top: 25px"
            />
          </div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
            <div style="padding: 25px; display: flex" width="100%">
              <div style="width: 10%">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/29a67025-65e8-4a71-a313-8b104cdee317/26x36.png"
                  style="margin-top: 10px"
                />
              </div>
              <div style="width: 90%">
                <div style="font-size: 20px; font-weight: bold">Front End</div>
                <div style="font-size: 12px; color: #F20101; font-weight: bold">
                  ${Math.round(frontend_total_hrs)} hrs
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div>
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
            style="padding: 0 0 0 60%"
          />
        </div>
  
        <div style="margin-top: 20px; display: flex">
          <div style="width: 20%">
            <span style="padding-left: 25px; margin-top: 25px"></span>
          </div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;">
            <div style="padding: 25px" width="100%">
              <div style="width: 33%;float: left;text-align: center;border-right: 1px solid #eeeeee;">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/6f46607e-2437-4a71-b255-521db2babb06/21x24.png"
                  style="margin-top: 10px"
                />
                <div style="font-size: 14px; font-weight: 700">Android</div>
                <div style="font-size: 12px; color: #F20101; font-weight: 600">
                  ${Math.round(frontend_android_hrs)} hrs
                </div>
              </div>
              <div style="width: 33%; float: right; text-align: center">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/d649217b-4b59-497f-ad56-b4d353cec59f/24x24.png"
                  style="margin-top: 10px"
                />
                <div style="font-size: 14px; font-weight: 700">Web App</div>
                <div style="font-size: 12px; color: #F20101; font-weight: 600">
                  ${Math.round(frontend_web_hrs)} hrs
                </div>
              </div>
              <div style="width: 33%;float: right;text-align: center;border-right: 1px solid #eeeeee;">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/b19a6fd8-fc93-4dd7-b300-2a8242390cc8/20x24.png"
                  style="margin-top: 10px"
                />
                <div style="font-size: 14px; font-weight: 700">iOS</div>
                <div style="font-size: 12px; color: #F20101; font-weight: 600">
                  ${Math.round(frontend_ios_hrs)} hrs
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 30px">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
            style="padding: 0 0 0 60%"
          />
        </div>
  
        <div style="margin-top: 20px; display: flex">
          <div style="width: 20%"></div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 80%;">
            <div style="padding: 25px" width="100%">
              <div width="100%">
                <div style="text-align: right; padding: 0 10px">
                  <h5 style="background: #595856;color: #ffffff;text-align: center;padding-top: 10px;padding-bottom: 10px;">
                    Feature List
                  </h5>
                </div>
                <div style="text-align: left; padding: 0 10px">
                  ${modular_list_full}
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 20px; display: flex">
          <div style="width: 20%">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f022be81-8d7d-40b6-92e7-598b62c8fa53/30x30.png"
              style="padding-left: 25px; margin-top: 25px"
            />
          </div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;">
            <div style="padding: 25px; display: flex" width="100%">
              <div style="width: 10%">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/67452889-614e-475b-8f9e-0d80f6253686/21x19.png"
                  style="margin-top: 10px"
                />
              </div>
              <div style="width: 90%">
                <div style="font-size: 20px; font-weight: bold">Backend</div>
                <div style="font-size: 12px; color: #F20101; font-weight: bold">
                  ${backend_hrs} hrs
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 30px">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
            style="padding: 0 0 0 60%"
          />
        </div>
  
        <div style="margin-top: 20px; display: flex">
          <div style="width: 20%">
            <span style="padding-left: 25px; margin-top: 25px"></span>
          </div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;">
            <div style=" display: flex" width="100%">
              <div style="width: 33%;text-align: center;border-right: 1px solid #eeeeee;">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/3c9d11c9-530d-45a2-8f0b-82154359a03a/24x24.png"
                  style="margin-top: 10px"
                />
                <div style="font-size: 14px; font-weight: 700">Web Services</div>
                <div style="font-size: 12px; color: #F20101; font-weight: 600">
                  ${webservices_hrs} hrs
                </div>
              </div>
              <div style="width: 33%; text-align: center;border-right: 1px solid #eeeeee;">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/e8c42d7f-f637-4a6d-afd7-ed1368c89993/19x24.png"
                  style="margin-top: 10px"
                />
                <div style="font-size: 14px; font-weight: 700">Database</div>
                <div style="font-size: 12px; color: #F20101; font-weight: 600">
                  ${Math.round(database_hrs)} hrs
                </div>
              </div>
              <div style="width: 33%;text-align: center;border-right: 1px solid #eeeeee;">
                  <img
                    src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/b1c7b097-c357-4726-993e-9579962b90b3/20x24.png"
                    style="margin-top: 10px"
                  />
                <div style="font-size: 14px; font-weight: 700">Admin Panel</div>
                <div style="font-size: 12px; color: #F20101; font-weight: 600">
                  ${admin_panel_hrs}
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 30px">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
            style="padding: 0 0 0 60%"
          />
        </div>
  
        <div style="margin-top: 20px; display: flex">
          <div style="width: 20%">
            <span style="padding-left: 25px; margin-top: 25px"></span>
          </div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 80%;padding: 0 60px;">
            <div width="50%">
              <div style="text-align: left; padding: 0 10px">
                <h5 style="background: #595856;color: #ffffff;text-align: center;padding: 10px 30px;">
                  Basic Features
                </h5>
              </div>
              <div style="text-align: left; padding: 0 10px">
              <ul>
                ${adminpanel_list_basic}
              </ul>
              </div>
            </div>
  
            <div width="50%">
              <div style="text-align: left; padding: 0 10px">
                <h5 style="background: #595856;color: #ffffff;text-align: center;padding: 10px 30px;">
                  Advance Features
                </h5>
              </div>
              <div style="text-align: left; padding: 0 10px">
              <ul>
                ${adminpanel_list_advance}
              </ul>
              </div>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 20px">
          <div style="float: left; width: 20%">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f022be81-8d7d-40b6-92e7-598b62c8fa53/30x30.png"
              style="padding-left: 25px; margin-top: 25px"
            />
          </div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
            <div style="padding: 25px" width="100%">
              <div style="width: 10%; float: left">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/1c44ecea-e05b-4202-a5fa-ec676afc4694/12x20.png"
                  style="margin-top: 10px"
                />
              </div>
              <div style="width: 90%; float: right">
                <div style="font-size: 20px; font-weight: bold">
                  Secondary Apps
                </div>
                <div style="font-size: 12px; color: #F20101; font-weight: bold">
                  ${Math.round(secondaryAppHrs)} hrs
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 30px">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
            style="padding: 0 0 0 60%"
          />
        </div>
  
        <div style="margin-top: 20px">
          <div style="float: left; width: 20%">
            <span style="padding-left: 25px; margin-top: 25px"></span>
          </div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
            <div style="padding: 25px" width="100%">
              <div style="width: 50%;float: left;text-align: center;border-right: 1px solid #eeeeee;">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/fe30a452-84cd-4e34-905c-ef88af8c85d6/24x19.png"
                  style="margin-top: 10px"
                />
                <div style="font-size: 14px; font-weight: 700">${primary_app_name}</div>
                <div style="font-size: 12px; color: #F20101; font-weight: 600">
                  ${Math.round(primary_app_efforts)} hrs
                </div>
              </div>
  
              <div style="width: 45%; float: right; text-align: center">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/58aab597-765d-4c63-a728-9cec635f4ca6/25x22.png"
                  style="margin-top: 10px"
                />
                <div style="font-size: 14px; font-weight: 700">${secondary_app_name}</div>
                <div style="font-size: 12px; color: #F20101; font-weight: 600">
                  ${Math.round(secondary_app_efforts)} hrs
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 30px">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
            style="padding: 0 0 0 60%"
          />
        </div>
  
        <div style="background-color: #f7f7f7;padding: 30px;margin-top: 20px;text-align: center;">
          <h4 style="font-weight: 600;margin-top: 0;font-size: 24px;margin-bottom: 5px;">
            Grand Total
          </h4>
          <h2 style="margin-top: 0;margin-bottom: 5px;font-size: 30px;letter-spacing: 3px;font-weight: 400;color: #F20101;">
            ${Math.round(amt_convertd)} ${conversion_data.currency_name}
          </h2>
          <p style="margin-top: 0; margin-bottom: 30px">
            If this is a bit unexpected, we are keen to help you to reduce this
            cost, Please answer a few more questions.
          </p>
        </div>
  
        <div style="text-align: center">
          <p style="margin: 30px 0">Try With Our Cost Calculator App</p>
          <span>
            <a href="https://play.google.com/store/apps/details?id=com.redbytes.projectcostcalculator&hl=en&gl=US">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/653dbb03-fb0f-4e75-a95a-c149526d95bb/5436x1604.png"
                style="height: 60px; width: 200px"
              />
            </a>
          </span>
          <span>
            <a href="https://apps.apple.com/gb/app/cost-calculator/id1482880672">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/4f466f9c-90d6-4259-87df-ddf9a8bb2872/1990x590.png"
                style="height: 60px; width: 200px"
              />
            </a>
          </span>
  
          <p style="text-align: center; margin: 30px 0">
            We hope this estimate is to your satisfaction and offers a
            comprehensive picture. For any further queries, we would be happy to
            respond at
          </p>
        </div>
  
        <div style="text-align: center; margin-top: 20px;">
          <table style="width: 100%">
            <tr>
              <td style="" valign="bottom">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/ed580ade-ae61-4f9b-95d7-5fc7f9f9e486/30x30.png"
                  style="margin-bottom: -9px;"/>
                <span style="margin-left: 5px;">www.redbytes.co.uk</span>
              </td>
  
              <td>
                <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/35e3a74f-0faa-4ecb-a54c-7ac71aec0e62/30x30.png"
                style="margin-bottom: -9px;"/>
                <span style="margin-left: 5px;">+44 17496084594</span>
              </td>
  
              <td>
                <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/c4d830a2-cc39-4dc8-8679-05a8527a939a/30x30.png"
                style="margin-bottom: -9px;"/>
              <span style="margin-left: 5px;">+1 9295521900</span>
              </td>
            </tr>
          </table>
        </div>
  
        <div>
          <h2 style="text-align: center;margin-top: 50px;margin-bottom: 10px;font-size: 20px;font-weight: bold;">
            More About App Development
          </h2>
        </div>
  
        <div style="box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 100%;">
          <div width="100%" style="display: flex; justify-content: center;">
            <div style="width: 40%;text-align: center;border: 1px solid #eeeeee;padding: 20px 0;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/95ff66f0-7260-4127-ba67-63d065f78e02/100x192.png"
                style="margin-top: 10px; width: 26px"/>
              <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
                How Much
              </div>
            </div>
  
            <div style="width: 40%;text-align: center;border: 1px solid #eeeeee;padding: 20px 0;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/ecff8b2b-32b4-4d09-9700-78865298bd88/243x243.png"
                style="margin-top: 10px; width: 48px"
              />
              <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
                How To
              </div>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 50px">
          <h2 style="color: #F20101; margin-top: 30px; margin-bottom: 0">
            DISCLAIMER
          </h2>
          <p style="margin-top: 10px">
            We have formulated this model based on Intelligent and Predictive
            analytics and is honed by years of industry experience. We can assure
            you that, based on your present preference, this estimate will be
            about 70-80 % accurate
          </p>
          <span style="color: #F20101"
            >Note: This email is generated from App Cost Calculator page -
            Redbytes
          </span>
        </div>
  
        <div style="margin-top: 20px" width="100%">
          <div style="float: left; width: 50%">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/9315d5c0-eac8-44fa-8bc2-ee4388763831/282x90.png"
              alt="Creating Email Magic"
              height="75"
            />
          </div>
          <div style="float: right; width: 50%; text-align: right">
            <div width="100%">
              <div class="cx-atext" style="text-align: right;margin-right: 5px;float: left;width: 90%;">
                <p style="margin: 0">3 Hardman Square</p>
                <p style="margin: 0">Spinningfields, Manchester</p>
                <p style="margin: 0">M3 3EB, UK</p>
              </div>
              
              <div width="10%" style="float: right">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/74801c97-6e6e-440f-b0c2-83bb8f58695f/30x30.png"
                  style="padding-top: 15px"/>
              </div>
  
            </div>
          </div>
        </div>
  
        <div style="border-bottom: 2px solid #eeeeee; margin-top: 40px; clear: both;"></div>
      </div>
    </body>
  </html>`;
  
  let pdf_file_path = '';
  let user_id_ts = Math.random() * (9999 - 1111) + 350;
  const file_name = "user_pdf-"+Math.round(user_id_ts);
  pdf_file_path = await html_to_pdf(file_name, customer_mail_template_version_red, origin);
  console.log('pdf_file_path = ',pdf_file_path);

  // const SENDGRID_APY_KEY = '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';
  const SENDGRID_APY_KEY = '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';
  sgMail.setApiKey(SENDGRID_APY_KEY);

  request(pdf_file_path, { encoding: null }, (err, res, body) => {
    if (err) { return err; }
    if (body) {
      const textBuffered = Buffer.from(body);

    const msg = {
      to: data.user_email, // Change to your recipient
      // from: 'info@redbytes.co.uk', // Change to your verified sender
      from: mail_sender, // Change to your verified sender
      subject: mail_subject,
      // templateId: 'd-b3204b004eb74382ae7f06c5589c2096',   // set template ID
      templateId: 'd-672f0fc1bc9441e0b17bbd5508c72f3d',   // set template ID
      dynamicTemplateData: {      // send required inputs/keys here
        rb_user_name: data.user_name,
        catagory_text: data.step1_domain_data,
        selected_platform: dis_platform,
        admin_panel: 'Yes',   
        web_application: (web == 1) ? 'Yes' : 'No',   // need inputs  based on web platform selection
        secondary_app: primary_app_name + ', ' + secondary_app_name,

        grand_cost: Math.round(amt_convertd)+' '+conversion_data.currency_name,  // round off the val
        timeline: Math.round(timeline_val) + ' Months',
        approx_cost: (Math.round(amt_convertd) - 3455)+ ' '+conversion_data.currency_name, // skip this
        category_name: data.step1_domain_data,
        total_effort: Math.round(grandTotalEfforts),
        screen_design_effort: uiscreenhrs,
        front_end_effort: Math.round(frontend_total_hrs),
        android_effort: Math.round(frontend_android_hrs),
        ios_effort: Math.round(frontend_ios_hrs),
        web_app_effort:Math.round(frontend_web_hrs),
        database_effort: Math.round(database_hrs),

        Primary_functional_basic_features: functional_list_basic,
        Primary_functional_advance_features: functional_list_advance,
        Primary_Non_functional_basic_features: nonfunctional_list_basic,
        Primary_Non_functional_advance_features: nonfunctional_list_advance,
        
        backend_effort: backend_hrs,
        web_services_effort: webservices_hrs,
        admin_panel_effort: admin_panel_hrs,
        adminpanel_basic_features: adminpanel_list_basic,
        adminpanel_advance_features: adminpanel_list_advance,

        secondary_app_effort: Math.round(secondaryAppHrs),
        first_app: primary_app_name,
        first_app_efforts: Math.round(primary_app_efforts),
        second_app: secondary_app_name,
        second_app_efforts: Math.round(secondary_app_efforts),
        
        // reduction details
        user_inputs_1:"",
        before_document:"-",
        after_document:"-",

        user_inputs_2: "-",
        before_cloud_service:"-",
        after_cloud_service:"-",

        user_inputs_3: "-",
        before_Tech_service:"-",
        after_Tech_service:"-",

        user_inputs_4: "-",
        before_screen_deisgn:"-",
        after_screen_deisgn:"-",

        user_inputs_5: "-",
        before_timeline_service:"-",
        after_timeline_service:"-",

        saved_cost:"-",
        reduced_cost:"-"
      },
      attachments: [
        {
          content: textBuffered.toString('base64'),
          filename: `${mail_attachment_name}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
          content_id: 'mytext',
        },
      ],
    }
    sgMail
      .send(msg)
      .then((response) => {
        console.log('mail sent');
    })
      .catch((error) => {
        console.log('mail sending failed');
    })
}
});
source_and_medium_url = source_and_medium_url.replaceAll('"','');
  // save lead in CRM
// array to string inputs
var functionalFeaturesBasic_arr = step3_feature_data.basic_feature;
var functionalFeaturesAdvance_arr = step3_feature_data.advance_feature;
const functional_features = functionalFeaturesBasic_arr.concat(functionalFeaturesAdvance_arr);  //ok
var current_date = new Date().toJSON().slice(0,10);  
var today = new Date(); 
var current_time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var current_date_for_enq = current_date+' '+current_time;

var options_inputs = {
  'method': 'POST',
  'url': 'https://admin.officecaller.com/api/leads/website_lead/',
  'headers': {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    "title": data.user_name,
    "first_name": data.user_name,
    "email": data.user_email,
    "phone": data.user_contact,
    "city": geo_data.city_name+', '+geo_data.country_name,
    "state": "",
    "country": geo_data.country_name, // get this dynamic
    "address_line": "",
    "latitude": "46412",
    "longitude": "12345",
    "contact_lead": "-",
    "app_category": data.step1_domain_data,
    "category_text": data.step1_domain_data,
    "app_platform": dis_platform,
    "cross_platfrom_status": "Yes",
    "which_cross_platform": "Native",
    "grand_cost": Math.round(amt_convertd)+' '+conversion_data.currency_name,
    "enq_date": current_date_for_enq,
    "favourite": "favourite here",
    "enq_through": "app OR web",  // need input
    "enq_from": source_and_medium_url,
    "enquiryfrom": source_and_medium_url,
    "country_code": geo_data.flag_code,
    "choosen_approach": "Native",
    "choosen_devices": "Smartphones",
    "choosen_screen_count": 10,   // need inputs
    "choosen_login_methods": [],  // need inputs
    "choosen_features": functional_features,
    "choosen_language": "Multiple", // need inputs
    "choosen_admin": "Yes ",  // set based on web platform selection
    "admin_efforts": admin_panel_hrs,   // set input
    "choosen_webapp": (web == 1)?"Yes":"No",    // need inputs
    "secondary_app": (app_primary == 1 || app_secondary == 1)?"No":"Yes",     // set based on other app selection
    "screen_efforts": uiscreenhrs,
    "webservices": Math.round(webservices_hrs),
    "webapp_efforts": Math.round(frontend_web_hrs),
    "ios_efforts": Math.round(frontend_ios_hrs),
    "android_efforts": Math.round(frontend_android_hrs),
    "crossplatform_efforts": 0,
    "secondary_app_efforts": Math.round(secondaryAppHrs),
    "features_efforts": 0,    // need inputs
    "database_efforts": Math.round(database_hrs),
    "grand_total_efforts": Math.round(grandTotalEfforts),
    "approx_cost": Math.round(grandTotalEfforts)+" ",   // need inputs
    "timeline_month": Math.round(timeline_val)+' Months',    // set based on efforts
    "user_comment": data.user_message,
    "mail_date": current_date_for_enq,
    "apikey": "7dac0fcac909b349"
  })

};
request(options_inputs, function (error, response) {
  if (error) throw new Error(error);
  console.log("CRM ENTRY ----->",response.body);
  res_msg = response.body;
}); 
  // =========================================

  var result = {
    // screenDesign: uiscreenhrs,
    status: "all ok with api v8",
    UPF_val: UPF,
    CAF_val: CAF,
    functionalPoint_val: functionalPoint,
    functionalFeature_cnt: functionalFeature_cnt, // ok
    screenDesignHours: uiscreenhrs,    // ok
    frontend: {
      totalHoursFrontend: frontend_total_hrs.toFixed(2),   // ok
      platforms: frontendPlatForms,   // ok
      functionalFeatures: step3_feature_data,   // ok
      nonFunctionalFeatures: step4_NonFunctional_data   // ok
    },
    backend: {
      totalHours: backend_hrs.toFixed(2),   // ok
      platforms: backendPlatforms,   // ok
      functionalFeatures: adminPanel_data   // ok
    },
    secondaryApp: {
      totalHours: secondaryAppHrs,   // ok
      platforms: secondaryAppPlatforms  // need to change title of other apps selected as per domain selection
    },
    totalEfforts: grandTotalEfforts.toFixed(2),
    grandTotalCost: amt_convertd.toFixed(2),
    currencyName:conversion_data.currency_name,
    singleAppefforts: total_hrs_for_single_app.toFixed(2),
    webAppEfforts: fn_nfn_hrs_total.toFixed(2),
    appOneCost: app_primary_cost.toFixed(2),
    appTwoCost: app_secondary_cost.toFixed(2),
    selectedTechnology: selectedTechnology,
    user_id: user_id,  // need to uncomment code in function - cross check once
    fn_nfn_hrs_total: fn_nfn_hrs_total,
    domanComplexityValue: domanComplexityValue,
    selectedDomainSlug: selectedDomainSlug,
    domain_img: 'https://www.redbytes.co.uk/wp-content/themes/redbytes_uk/images/' + selectedDomainSlug + '.png'
  }
  return result;
}

const getCostReductionDetails = async (data, user_id, pure_ip,mail_sender,mail_subject,mail_attachment_name,utm_source) => {
  let remote_ip = '118.185.160.93';   // change this later

  const geo_data = await getGeoDetails(pure_ip);
  // console.log('>>>>>>>>>>>'+glb_adm_advance_list);
  // console.log('>>>>>>>>>>>'+globalString);
  // collect the data
  var totalEfforts = data.totalEfforts;
  var totalCost = data.totalCost;
  var selectedPlatforms = '';
  var screenDesignStatus = data.screenDesignStatus;
  var selectedTechnology = data.selectedTechnology;
  var pltf_length = data.selectedPlatforms.length
  if(pltf_length > 1){
    // selectedPlatforms = data.selectedPlatforms.join(', ');
    selectedPlatforms = data.selectedPlatforms;
  } else{
    selectedPlatforms = data.selectedPlatforms;
  }
  let is_reduced = true;
  // var OtherAppData = ["Secondary_app"];
  // var sec_app_length = OtherAppData.length; // set this also
  var sec_app_length = data.selectedOtherApp.length; // set this also
  var selectedOtherApp = '';
  if(sec_app_length == 0 ){
    selectedOtherApp = '-';
  } else if(sec_app_length == 1){
    selectedOtherApp = data.OtherAppData;
  } else if(sec_app_length > 1){
    selectedOtherApp = data.OtherAppData.join(', ');
  }
  var selectedTimeline = data.selectedTimeline;
  
  var finalCostReduced = data.finalCostReduced;
  var finaleffortsInHrs = data.finaleffortsInHrs;
  var savedAmount = data.savedAmount;
  var user_id = data.user_id;

  // collect all costs
  var screenDesignReducedCost = Math.round(totalCost)+'-'+Math.round(data.screenDesignReducedCost);
  var platformReducedCost = screenDesignReducedCost+'-'+Math.round(data.platformReducedCost);
  var technologyReducedCost = platformReducedCost+'-'+Math.round(data.technologyReducedCost);
  var otherAppReducedCost = technologyReducedCost+'-'+Math.round(data.otherAppReducedCost);
  var timelineReducedCost = otherAppReducedCost+'-'+Math.round(data.timelineReducedCost);

  // update record with reduced cost
  var sqlquery = 'UPDATE app_cost_calculator SET rd_screen_design = ?, rd_screen_design_cost = ?, rd_platform_selected = ?, rd_platform_cost = ?, rd_tech_selected = ?, rd_tech_cost = ?, rd_other_apps_selected = ?, rd_otherapp_cost = ?, rd_timeline_selected = ?, hours_after_reduction = ?, cost_after_reduction = ?, saved_amount = ? where user_id = ?';
  var params = [ screenDesignStatus, screenDesignReducedCost, selectedPlatforms, platformReducedCost, selectedTechnology, technologyReducedCost, selectedOtherApp, otherAppReducedCost, selectedTimeline, finaleffortsInHrs, finalCostReduced, savedAmount, user_id];  
  var rows = await db.dbQuery(sqlquery, params);

  // get phase - 1 details from database
  var qry_select = 'SELECT * FROM `app_cost_calculator` LEFT JOIN users on app_cost_calculator.user_id = users.user_id WHERE app_cost_calculator.user_id = ?';
  var input_params = [ user_id ];
  var estm_result = await db.dbQuery(qry_select, input_params);
  console.log(estm_result[0].domain_id);  // ok
  var otherapps = [];
  var primary_app_name = '';
  var secondary_app_name = '';
  if(estm_result[0].other_app_names != ''){
    otherapps = (estm_result[0].other_app_names).split(',');
    primary_app_name = (!otherapps[0])?'':otherapps[0];
    secondary_app_name = (!otherapps[1])?'':otherapps[1];
  }
  
  // send email on successful reduction phase
  var dis_platform = '';
  if(estm_result[0].is_android == 1){
    dis_platform += 'Android, ';
  }
  if(estm_result[0].is_ios == 1){
    dis_platform += 'iOS, ';
  }
  if(estm_result[0].is_web == 1){
    dis_platform += 'Web, ';
  }

  var data_pdf_path = await fetchGetMethod('save_pdf?user_id=' + user_id);
  console.log(data_pdf_path);
  // set functional features - basic list
  var functional_list_basic = "";
  let fnb_list = (estm_result[0].ff_basic_list).split(", ")
  fnb_list.map(item => {
    functional_list_basic += "<li>"+item+"</li>"
  } )

  // set functional features - advance list
  var functional_list_advance = "";
  let fnad_list = (estm_result[0].ff_advance_list).split(", ")
  fnad_list.map(item => {
    functional_list_advance += '<li>'+item+'</li>'
  } )
    
  // set non-functional features - basic list
  var nonfunctional_list_basic = "";
  let nfnb_list = (estm_result[0].nff_basic_list).split(", ")
  nfnb_list.map(item => {
    nonfunctional_list_basic += '<li>'+item+'</li>'
  } )

  // set non-functional features - advance list
  var nonfunctional_list_advance = "";
  let nfnad_list = (estm_result[0].nff_advance_list).split(", ")
  nfnad_list.map(item => {
    nonfunctional_list_advance += '<li>'+item+'</li>'
  } )
    
  // set admin-panel features - basic list
  var adminpanel_list_basic = "";
  let admb_list = (estm_result[0].adm_basic_list).split(", ")
  admb_list.map(item => {
    adminpanel_list_basic += '<li>'+item+'</li>'
  } )

  // set admin-panel features - advance list
  var adminpanel_list_advance = "";
  let admad_list = (estm_result[0].adm_advance_list).split(", ")
  admad_list.map(item => {
    adminpanel_list_advance += '<li>'+item+'</li>'
  } ) 

  var uiscreenhrs = 150;

  var before_document = Math.round(totalCost);
  var after_document = Math.round(data.screenDesignReducedCost);

  var before_cloud_service = after_document;
  var after_cloud_service = Math.round(data.platformReducedCost);

  var before_Tech_service = after_cloud_service;
  var after_Tech_service = Math.round(data.technologyReducedCost);

  var before_screen_deisgn = after_Tech_service;
  var after_screen_deisgn = Math.round(data.otherAppReducedCost);


  var before_timeline_service = after_screen_deisgn;
  var after_timeline_service = Math.round(data.timelineReducedCost);

  var timeline_val = estm_result[0].total_efforts / 730;   // 730 hrs for a month
  // send email with sendgrid
  // const SENDGRID_APY_KEY = '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';
  const SENDGRID_APY_KEY = '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';
  sgMail.setApiKey(SENDGRID_APY_KEY);


  request(data_pdf_path, { encoding: null }, (err, res, body) => {
    if (err) { return err; }
    if (body) {
      const textBuffered = Buffer.from(body);

      const msg = {
        to: estm_result[0].email, // Change to your recipient
        // to: 'shubhangiramekar48@gmail.com',
        // from: 'info@redbytes.co.uk', // Change to your verified sender
        from: mail_sender, // Change to your verified sender
        subject: `${mail_subject}`,
        // templateId: 'd-b3204b004eb74382ae7f06c5589c2096',   // set template ID
        templateId: 'd-672f0fc1bc9441e0b17bbd5508c72f3d',   // set template ID
        dynamicTemplateData: {      // send required inputs/keys here
          rb_user_name: estm_result[0].user_name,
          catagory_text: estm_result[0].domain_id,
          selected_platform: dis_platform.replace(/,\s*$/, ""),  
          admin_panel: 'Yes',   // it's default
          web_application: (estm_result[0].is_web == 1) ? 'Yes' : 'No',   // based on web platform selection
          secondary_app: primary_app_name + ', ' + secondary_app_name,  // need to manage
          approx_cost:Math.round(estm_result[0].total_cost - 1583)+' '+geo_data.currency_name,   // change this later
          grand_cost: Math.round(estm_result[0].total_cost)+' '+geo_data.currency_name,  // round off the val
          timeline: Math.round(timeline_val) + ' Months',
          category_name: estm_result[0].domain_id,
          total_effort: Math.round(estm_result[0].total_efforts),
          screen_design_effort: uiscreenhrs,

          front_end_effort: estm_result[0].frontend_efforts,
          android_effort: estm_result[0].android_efforts,
          ios_effort: estm_result[0].ios_efforts,
          web_app_effort: estm_result[0].web_efforts,
          database_effort: estm_result[0].db_efforts,

          Primary_functional_basic_features: functional_list_basic,
          Primary_functional_advance_features: functional_list_advance,
          Primary_Non_functional_basic_features: nonfunctional_list_basic,
          Primary_Non_functional_advance_features: nonfunctional_list_advance,
          
          backend_effort: estm_result[0].backend_efforts,
          web_services_effort: estm_result[0].webservices_efforts,
          admin_panel_effort: estm_result[0].adm_panel_efforts,
          adminpanel_basic_features: adminpanel_list_basic,
          adminpanel_advance_features: adminpanel_list_advance,

          secondary_app_effort: estm_result[0].secondaryapp_efforts,
          first_app: primary_app_name,  // set this as per domain name
          first_app_efforts: ((estm_result[0].secondaryapp_efforts) / 2),
          second_app: secondary_app_name, // set this as per domain name
          second_app_efforts: ((estm_result[0].secondaryapp_efforts) / 2),
          secondaryapp_functional_basic_features: estm_result[0].ff_basic_list,
          secondaryapp_functional_advance_features: estm_result[0].ff_advance_list,
          secondaryapp_Non_functional_basic_features: estm_result[0].nff_basic_list,
          secondaryapp_Non_functional_advance_features: estm_result[0].nff_advance_list,

          // reduction details
          is_reduced : is_reduced,
          user_inputs_1:screenDesignStatus.toUpperCase(),
          before_document:before_document,
          after_document:after_document,

          user_inputs_2: selectedPlatforms,
          before_cloud_service:before_cloud_service,
          after_cloud_service:after_cloud_service,

          user_inputs_3: selectedTechnology.toUpperCase(),
          before_Tech_service:before_Tech_service,
          after_Tech_service:after_Tech_service,

          user_inputs_4: selectedOtherApp,
          before_screen_deisgn:before_screen_deisgn,
          after_screen_deisgn:after_screen_deisgn,

          user_inputs_5: selectedTimeline,
          before_timeline_service:before_timeline_service,
          after_timeline_service:after_timeline_service,

          saved_cost:savedAmount+' '+geo_data.currency_name,
          reduced_cost:after_timeline_service+' '+geo_data.currency_name
        },
        attachments: [
          {
            content: textBuffered.toString('base64'),
            filename: `${mail_attachment_name}.pdf`,
            type: 'application/pdf',
            disposition: 'attachment',
            content_id: 'mytext',
          },
        ],
      }

      sgMail
        .send(msg)
        .then((response) => {
          // return res.status(200).json({ status: true, message: "success" })
          console.log("success");
        })
        .catch((error) => {
          // return res.status(500).json({ status: false, message: error })
          console.log("error");
        })
    }
    
  });


  var result = {
    status: "success",    // ok
    message: "all ok with api v3",
  }
  return result;
}

// api for CloudXperte
const getAllCostEstimationCX = async (data, user_id, remote_ip, template_version, request_from, origin,mail_sender,mail_subject,mail_attachment_name) => {
  console.log('function called EstimationCX');
  var step2_platform_data = data.step2_platform_data;
  var step3_feature_data = data.step3_feature_data;
  var step4_NonFunctional_data = data.step4_NonFunctional_data;
  var adminPanel_data = data.AdminPanel_data;
  var other_apps = data.OtherAppData;
  var step1_domain_data = data.step1_domain_data;
  var workingEfforts = data.workingEfforts;
  var selectedFeatures = data.selected_features;
  var selectedDomainSlug = data.selected_domain_slug;
  let modular_feature = data.features_modules
  let modular_feature_for_secondaryapps = data.features_modules_sec || [];
  let modular_features_modules_tertiaryapp = data.features_modules_ter || [];
  let nonfunctional_features_for_secondaryapp = data.step4_NonFunctional_data_sec;
  let modular_list_full = "";
  let modular_list_full_secondaryapps = "";
  let modular_list_full_tertiaryapps = "";
  let admin_modules = data.admin_modules;
  console.log("**********1**********")

  console.log("modular_feature --->",modular_feature)
  // primary app modular list
  let modl_list1 = Object.keys(modular_feature).filter((item) => {
    if(modular_feature[item].length > 0){
      return item
    }
  });

  const module_list_selected = [];
  const module_list_selected_secondary = [];
  modl_list1?.map(item =>{ 
  modular_list_full += '<li>'+item;
  modular_list_full += '<ul>';
  modular_feature[item].map(feature =>{
      modular_list_full += '<li>'+feature+'</li>';
    })
    modular_list_full += '</ul>';
    modular_list_full += '</li>'
  })
  // secondary app modular list
  let modl_list2 = Object.keys(modular_feature_for_secondaryapps)
  console.log(modl_list2);
  modl_list2?.map(item =>{ 
    modular_list_full_secondaryapps += '<li>'+item;
    modular_list_full_secondaryapps += '<ul>';
    modular_feature_for_secondaryapps[item].map(feature =>{
    modular_list_full_secondaryapps += '<li>'+feature+'</li>';
    })
    modular_list_full_secondaryapps += '</ul>';
    modular_list_full_secondaryapps += '</li>'
  })

  // tertiary app modular list
  let modl_list3 = Object.keys(modular_features_modules_tertiaryapp)

  modl_list3?.map(item =>{ 
    modular_list_full_tertiaryapps += '<li>'+item;
    modular_list_full_tertiaryapps += '<ul>';
    modular_features_modules_tertiaryapp[item].map(feature =>{
    modular_list_full_tertiaryapps += '<li>'+feature+'</li>';
    })
    modular_list_full_tertiaryapps += '</ul>';
    modular_list_full_tertiaryapps += '</li>'
  })

  
  // let allUnits;
  // if(request_from == 'app'){
  //   allUnits = await getFeatureUnitsForApp();
  // } else{
  //   allUnits = await getFeatureUnits();  
  // }
  // var factorSumArray = [];
  // allUnits.forEach(value => {
  //   var sumOfEachunit = findSumOfEachUnit(selectedFeatures, value, request_from);
  //   factorSumArray.push(sumOfEachunit);
  // })
  console.log("**********2**********")
  // var UPF = factorSumArray.reduce((a, b) => a + b, 0);
  // console.log('UPF ----------> '+UPF);
  // var complexityValues = await getdomainComplexityValue();
  // const complexity_val = complexityValues.filter(function (e) { return e.d_slug == selectedDomainSlug }).map(ele => ele.value);
  // var domanComplexityValue = 0;
  // if (complexity_val.length != 0) {
  //   //  domanComplexityValue = complexity_val[0];
  //   domanComplexityValue = complexity_val[0];
  // } else {
  //   domanComplexityValue = 0
  // }
  // var CAF = parseFloat(0.65 + (0.01 * domanComplexityValue)).toFixed(2);  // Complexity Adjustment 
  // var functionalPoint = parseFloat(UPF * CAF).toFixed(2);
  // var functionalFeature_cnt = parseFloat(functionalPoint * 8);//8 is total working hours in a day
  // var workingEfforts = parseFloat(functionalPoint * 8);//8 is total working hours in a day
  var uiscreenhrs = 150;  // fixed
  var source_and_medium_url = data.screenDesignStatus; // data.screenDesignStatus;    // getting utm source and medium value
  // note: to avoid mobile app crashing, re-used screenDesignStatus key to get this value. change it in next mobile version update
  var app_primary = 0; var app_secondary = 0;
  var total_apps = 1;   // 1 for main app compulsory (other app selection is not needed)

  // get count for other apps selected 
  if (other_apps.includes("primary_app") == true) {
    app_primary = 1;
  }
  if (other_apps.includes("Secondary_app") == true) {
    app_secondary = 1;
  }
  console.log("**********3**********")
  var non_functional_fts_hrs = 100;   // 100 for non_functional_fts_hrs is fixed
  var percent_of = 60;    // for web platform
  var other_app_percent_of = 40;  // for other app
  // var fn_nfn_hrs_total = parseFloat(functionalFeature_cnt + non_functional_fts_hrs);
  // let total_hrs_for_single = workingEfforts;
  var frontend_android_hrs = 0; var frontend_ios_hrs = 0; var frontend_web_hrs = 0;
  var frontend_total_hrs = 0;
  var selectedTechnology = (data.selectedTechnology == undefined) ? 'native' : data.selectedTechnology; //fixed
  var total_platform = 0;
  var total_app = 1;    // 1 for main app compulsory (other app selection is not needed)
  var dis_platform = '';
  var android = 0;
  var ios = 0;
  var web = 0;
  var frontendPlatForms = [];
  let andr_ios_hrs = 0;
  console.log("**********4**********")
  if (step2_platform_data.includes("Web")) {
    web = 1;
    frontend_web_hrs = ((percent_of / 100) * parseFloat(data.primary_app_estimation));   // 60 % of primary app efforts
    andr_ios_hrs = parseFloat(data.primary_app_estimation) - frontend_web_hrs;   // remaining for android + ios at equal
    frontend_total_hrs = frontend_android_hrs + frontend_ios_hrs + frontend_web_hrs;
    var pltFrm = {
      title: "Web",
      hours: frontend_web_hrs.toFixed(2)
    }
    frontendPlatForms.push(pltFrm);
  } else {
    var pltFrm = {
      title: "Web",
      hours: frontend_web_hrs
    }
    frontendPlatForms.push(pltFrm);
  }

  if (step2_platform_data.includes("Android")) {
    android = 1;
    frontend_android_hrs = (andr_ios_hrs > 0)?andr_ios_hrs/2:parseFloat(data.primary_app_estimation)/2;
    frontend_total_hrs = frontend_android_hrs + frontend_ios_hrs + frontend_web_hrs;
    var pltFrm = {
      title: "Android",
      hours: frontend_android_hrs.toFixed(2)
    }
    frontendPlatForms.push(pltFrm);
  } else {
    var pltFrm = {
      title: "Android",
      hours: frontend_android_hrs
    }
    frontendPlatForms.push(pltFrm);
  }

  if (step2_platform_data.includes("iOS")) {
    ios = 1;
    frontend_ios_hrs = (andr_ios_hrs > 0)?andr_ios_hrs/2:parseFloat(data.primary_app_estimation)/2;
    frontend_total_hrs = frontend_android_hrs + frontend_ios_hrs + frontend_web_hrs;
    var pltFrm = {
      title: "iOS",
      hours: frontend_ios_hrs.toFixed(2)
    }
    frontendPlatForms.push(pltFrm);
  } else {
    var pltFrm = {
      title: "iOS",
      hours: frontend_ios_hrs
    }
    frontendPlatForms.push(pltFrm);
  }
  console.log("**********5**********")
  total_platform = parseInt(android) + parseInt(ios) + parseInt(web);
  dis_platform = step2_platform_data.join(', ');

  console.log("step2_platform_data::",step2_platform_data);
  console.log("dis_platform:::",dis_platform);

  // collect list of features
  // functionals
  var functionalFeatures = step3_feature_data.basic_feature.join(', ');
  functionalFeatures += step3_feature_data.advance_feature.join(', ');
  // non-functionals
  var nonFunctionalFeatures = step4_NonFunctional_data.Basic_feature.join(', ');
  nonFunctionalFeatures += step4_NonFunctional_data.Advance_feature.join(', ');
  // admins
  var adminPanelFeatures = adminPanel_data.Basic_feature.join(', ');
  adminPanelFeatures += adminPanel_data.Advance_feature.join(', ');

  // collect feature list seperately
  // functionals
  var functionalFeaturesBasic = step3_feature_data.basic_feature.join(', ');
  var functionalFeaturesAdvance = step3_feature_data.advance_feature.join(', ');
  // non-functionals
  var nonFunctionalFeaturesBasic = step4_NonFunctional_data.Basic_feature.join(', ');
  var nonFunctionalFeaturesAdvance = step4_NonFunctional_data.Advance_feature.join(', ');
  // admins
  var adminPanelFeaturesBasic = adminPanel_data.Basic_feature.join(', ');
  var adminPanelFeaturesAdvance = adminPanel_data.Advance_feature.join(', ');

  console.log("**********6**********")
  // set module list for primary
  var module_list_full = "";
  modl_list1?.map(item => {
      module_list_full += "<li>"+item+"</li>"
  } )

  console.log("Payload =======>>",admin_modules)

  // set module list for Admin Panel
  var admin_module_list_full = "";
  admin_modules?.map(module => {
    admin_module_list_full += "<li>"+module+"</li>"
  } )

  console.log("admin_module_list_full =======>>",admin_module_list_full)

    // set module list for primary
    var secondaryapp_module_list_full = "";
    modl_list2?.map(item => {
        secondaryapp_module_list_full += "<li>"+item+"</li>"
    } )

    // set module list for tertiary
    var tertiary_module_list_full = "";
    modl_list3?.map(item => {
      tertiary_module_list_full += "<li>"+item+"</li>"
    } )
    

  // set functional features - basic list
  var functional_list_basic = "";
  let fnb_list = step3_feature_data.basic_feature
  fnb_list?.map(item => {
    functional_list_basic += "<li>"+item+"</li>"
  } )

  // set functional features - advance list
  var functional_list_advance = "";
  let fnad_list = step3_feature_data.advance_feature
  fnad_list?.map(item => {
    functional_list_advance += '<li>'+item+'</li>'
  } )

  // set non-functional features - basic list
  var nonfunctional_list_basic = "";
  let nfnb_list = step4_NonFunctional_data.Basic_feature
  nfnb_list?.map(item => {
    nonfunctional_list_basic += '<li>'+item+'</li>'
  } )

  // set non-functional features - advance list
  var nonfunctional_list_advance = "";
  let nfnad_list = step4_NonFunctional_data.Advance_feature
  nfnad_list?.map(item => {
    nonfunctional_list_advance += '<li>'+item+'</li>'
  } )

  // set admin-panel features - basic list
  var adminpanel_list_basic = "";
  let admb_list = adminPanel_data.Basic_feature
  admb_list?.map(item => {
    adminpanel_list_basic += '<li>'+item+'</li>'
  } )

  // set admin-panel features - advance list
  var adminpanel_list_advance = "";
  let admad_list = adminPanel_data.Advance_feature
  admad_list?.map(item => {
    adminpanel_list_advance += '<li>'+item+'</li>'
  } )  
  console.log("**********7**********")
  var total_apps_sel = parseInt(total_app) + parseInt(app_primary) + parseInt(app_secondary);
  // fixed values
  var webServiceHrs = 20;
  var adminPanelHrs = 100;
  var databaseHrs = 10;

  // calculate hours for backend
  // var webservices_hrs = webServiceHrs * total_platform;
  // var database_hrs = databaseHrs * total_apps_sel;
  // var admin_panel_hrs = adminPanelHrs * total_apps_sel;
  var webservices_hrs = parseFloat(data.admin_panel_estimation)*10/100;
  var database_hrs = parseFloat(data.admin_panel_estimation)*5/100;
  var admin_panel_hrs = parseFloat(data.admin_panel_estimation)*85/100;
  // var backend_hrs = webservices_hrs + database_hrs + admin_panel_hrs;
  var backend_hrs = parseFloat(data.admin_panel_estimation);
  var backendPlatforms = [
    {
      title: "Web Service",
      hours: webservices_hrs.toFixed(2)
    },
    {
      title: "Admin Panal",
      hours: database_hrs.toFixed(2)
    },
    {
      title: "Database",
      hours: admin_panel_hrs.toFixed(2)
    }
  ];
  console.log("**********8**********")
  // calculate hours for secondary apps
  var other_app_only = 0;
  var primary_app_name = '';
  var secondary_app_name = '';
  var tertiary_app_name = '';
  var primary_app_efforts = 0;
  var secondary_app_efforts = 0;
  var tertiary_app_efforts = 0;
  var other_app_icon1 = '';
  var other_app_icon2 = '';
  // other_app_only = app_primary + app_secondary;
  // var other_app_total_hrs = ((other_app_percent_of / 100) * total_hrs_for_single);
  var other_app_total_hrs = 0;
  var is_primary_app = '';
  var is_secondary_app = '';
  var secondaryAppPlatforms = [];
  var app_primary_cost = 0; var app_secondary_cost = 0; var app_tertiary_cost = 0;
  let secondary_app_estimation, tertiary_app_estimation, otherapp_selected;
  let secd_app_names = '';
  if(request_from == "app"){
    secondary_app_estimation = data.secondary_app_estimation
    tertiary_app_estimation = data.tertiary_app_estimation || 0
    otherapp_selected = data.OtherAppData
    if(otherapp_selected.length == 0){
      var pltFrm = {
        title: '-',
        app_icon: '-',
        hours: 0
      }
      // secondaryAppPlatforms.push(pltFrm);
    } else{ 
    otherapp_selected.map(item =>{
      if(item.slug == "primary_app"){
        primary_app_efforts = (otherapp_selected.length == 1)?parseFloat(secondary_app_estimation):parseFloat(secondary_app_estimation)/2;
        var pltFrm = {
          title: item.nameApp,
          app_icon: other_app_icon1,
          // hours: Math.round(primary_app_efforts)
          hours: Math.round(data.primary_app_estimation)
        }
        app_primary_cost = (primary_app_efforts.toFixed(2) * 10)
        secondaryAppPlatforms.push(pltFrm);
        secd_app_names += item.nameApp+' '
      } else {
        var pltFrm = {
          title: '-',
          app_icon: '-',
          hours: 0
        }
        primary_app_efforts = 0;
        // secondaryAppPlatforms.push(pltFrm);
        primary_app_name = ''
      }
      // =============================================
      if(item.slug == "secondary_app"){
        secondary_app_efforts = (otherapp_selected.length == 1)?parseFloat(secondary_app_estimation):parseFloat(secondary_app_estimation)/2;
        var pltFrm = {
          title: item.nameApp,
          app_icon: other_app_icon1,
          // hours: Math.round(secondary_app_efforts)
          hours: Math.round(secondary_app_estimation)
        }
      
        app_secondary_cost = (secondary_app_efforts.toFixed(2) * 10)
        secondaryAppPlatforms.push(pltFrm);
        secd_app_names += item.nameApp+' '
        } else {
          var pltFrm = {
            title: '-',
            app_icon: '-',
            hours: 0
          }
          secondary_app_efforts = 0;
          // secondaryAppPlatforms.push(pltFrm);
          secondary_app_name = ''
        }
        if(item.slug == 'tertiary_app'){
          tertiary_app_efforts = (otherapp_selected.length == 1)?parseFloat(secondary_app_estimation):parseFloat(secondary_app_estimation)/2;
          var pltFrm = {
            title: item.nameApp,
            app_icon: other_app_icon1,
            // hours: Math.round(tertiary_app_efforts)
            hours: Math.round(data.tertiary_app_estimation) 
          }
          app_tertiary_cost = (tertiary_app_efforts.toFixed(2) * 10)
          secondaryAppPlatforms.push(pltFrm);
          secd_app_names += item.nameApp+' '
        }else{
          tertiary_app_efforts = 0;
          tertiary_app_name = ''
        }
      })
    }
  } 
  else if(request_from == "web") {
    secondary_app_estimation = data.secondary_app_estimation
    otherapp_selected = data.OtherAppData
    if(otherapp_selected.length == 0){
      var pltFrm = {
        title: '-',
        app_icon: '-',
        hours: 0
      }
      // secondaryAppPlatforms.push(pltFrm);
    } else{
    otherapp_selected.map((item) =>{
      if(item.slug == "primary_app"){
        primary_app_efforts = (otherapp_selected.length == 1)?parseFloat(secondary_app_estimation):parseFloat(secondary_app_estimation)/2;
        var pltFrm = {
          title: item.nameApp,
          app_icon: other_app_icon1,
          hours: Math.round(primary_app_efforts)
        }
        app_primary_cost = (primary_app_efforts.toFixed(2) * 10)
        secondaryAppPlatforms.push(pltFrm);
        secd_app_names += item.nameApp+' '
      } else {
        var pltFrm = {
          title: '-',
          app_icon: '-',
          hours: 0
        }
        primary_app_efforts = 0;
        // secondaryAppPlatforms.push(pltFrm);
        primary_app_name = ''
      }
      // =============================================
      if(item.slug == "secondary_app"){
        secondary_app_efforts = (otherapp_selected.length == 1)?parseFloat(secondary_app_estimation):parseFloat(secondary_app_estimation)/2;
      var pltFrm = {
        title: item.nameApp,
        app_icon: other_app_icon1,
        hours: Math.round(secondary_app_efforts)
      }
      
      app_secondary_cost = (secondary_app_efforts.toFixed(2) * 10)
      secondaryAppPlatforms.push(pltFrm);
      secd_app_names += item.nameApp+' '
      } else {
        var pltFrm = {
          title: '-',
          app_icon: '-',
          hours: 0
        }
        secondary_app_efforts = 0;
        // secondaryAppPlatforms.push(pltFrm);
        secondary_app_name = ''
      }
    })
  }
  }
  var secondaryAppHrs = 0;
  // var secondaryAppHrs = other_apps.length * other_app_total_hrs;
  // console.log('other_app_total_hrs --------------> '+other_app_total_hrs);
  var grandTotalEfforts = 0;
  grandTotalEfforts = parseFloat(uiscreenhrs) + parseFloat(data.primary_app_estimation) + parseFloat(data.admin_panel_estimation) + parseFloat(data.secondary_app_estimation ? data.secondary_app_estimation : 0) + parseFloat(data.tertiary_app_estimation ? data.tertiary_app_estimation : 0);
  console.log('grandTotalEfforts -------------> '+grandTotalEfforts);
  var grandTotalCost = 0;
  if (selectedTechnology == "native") {
    grandTotalCost = parseFloat(grandTotalEfforts * 10);
  } else if (selectedTechnology == "CROSS-PLATFORM") {
    grandTotalCost = parseFloat(((grandTotalEfforts * 10) * 30) / 100);   // of 30% val
  }

  let amt_convertd = 0;
  let currency_rate_value = 0;
  let secondary_app_selected = data.OtherAppData.length == 0 ? false : true

  const geo_data = await getGeoDetails(remote_ip);
  const conversion_data = await getConversionDetails(geo_data.currency_name, grandTotalCost);

  amt_convertd = conversion_data.converted_amt;
  currency_rate_value = conversion_data.currency_rate;
  var timeline_val = grandTotalEfforts / 240;   // 730 hrs for a month
  var dt = datetime.create();
  console.log('=>>>>>>>>>>>>>>>>>> all ok');
  // generate pdf for cost breakups
  let web_application = (web == 1) ? 'Yes' : 'No'
  let user_id_ts = Math.random() * (9999 - 1111) + 350;
  const file_name = "user_pdf-"+Math.round(user_id_ts);
  // const customer_mail_template = "<h1>test pdf for user id "+Math.round(user_id_ts)+"</h1>";
  let output = '';
  let output_in_email = '';
  console.log("secondaryAppPlatforms",secondaryAppPlatforms)
  secondaryAppPlatforms.map((item) => {
    console.log(item.title+ ' --- '+item.hours);
    if(item.title != '-'){
      output += `<div style="width: 45%; float: left; text-align: center">
      <img
        src="https://costcalculator.redbytes.in/sec_app_${template_version == 'red' ? 'rb' : template_version == 'purple' ? 'pb' : 'cx'}.png"
        width="25px"
        height="27px"
        style="margin-top: 10px"
      />
      <div style="font-size: 14px; font-weight: 700">${item.title}</div>
      <div style="font-size: 12px; color: ${template_version == 'red' ? '#F20101' : template_version == 'purple' ? '#491C61' : '#2A50EB'}; font-weight: 600">
        ${Math.round(item.hours)} hrs
      </div>
    </div>`;
    output_in_email += `<div style="display: inline-block; padding:10px 25px 0 50px; text-align: center;width: 30%;">
    <img
      src="https://costcalculator.redbytes.in/sec_app_${template_version == 'red' ? 'rb' : template_version == 'purple' ? 'pb' : 'cx'}.png"
      width="25px"
      height="27px"
      style="margin-top: 10px"
    />
    <p style="font-size:14px; margin-top:10px; margin-bottom:0; font-weight:700;">${item.title}</p>
    <span style="font-size: 12px; color:${template_version == 'red' ? '#F20101' : template_version == 'purple' ? '#491C61' : '#2A50EB'}; font-weight:700">${Math.round(item.hours)} hrs</span></div>`;
      
    }
 });
let secondary_app_modular_list = ``;
if(other_apps.length > 0){
  secondary_app_modular_list = `<div style="margin-top: 0px; display: flex">
  <div style="width: 10%"></div>
  <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 90%;">
    <div style="padding: 12px 25px" width="100%">
      <div width="100%">
        <div style="text-align: right; padding: 0 10px">
          <h5 style="background: #595856;color: #ffffff;text-align: center;padding-top: 10px;padding-bottom: 10px;">
            Feature List
          </h5>
        </div>
        <div style="text-align: left; padding: 0 10px">
          <ul style="list-style-type:disc;">${modular_list_full_secondaryapps}</ul>
        </div>
      </div>
    </div>
  </div>
</div>`
}

let customer_mail_template = `<!DOCTYPE html>
<html lang="en">
  <head>
  </head>
  <body
    style="font-family: Overpass, sans-serif;box-sizing: border-box;padding: 0;margin:0;">
    <div class="main-container" style="padding:50px;padding-top:0px">
      <div>
        <div>
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/816a3a60-be94-4a51-8144-b5330ff87d59/200x70.png" alt="Creating Email Magic" width="150"/>
          <img src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/1f877a2d-6669-4c59-bcf7-7814894a2474/284x91.png" alt="Creating Email Magic" style="float: right" height="75" />
        </div>
      </div>

      <div class="pg-title" style="text-align: right">
        <h2>MOBILE APP COST CALCULATOR</h2>
      </div>

      <div style="border-top: 2px solid #2a50eb"></div>
      <div style="text-align: center">
        <img src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/d2884548-259c-434c-9406-fbdfdc6e6155/2293x1368.png" style="width: 550px; margin-top: 20px" alt="image" />
      </div>

      <div style="margin-top: 20px; border-bottom: 1px solid #eeeeee">
        <h2 class="heading" style="text-align: center; color: #2a50eb">
          Greetings!
        </h2>
        <p style="font-size: 14px;line-height: 25px;padding: 1px 20px;font-weight: 600;">
          Dear ${data.user_name},
        </p>
        <p style="font-size: 14px;line-height: 25px;padding: 1px 20px;font-weight: 500;">
          Thank you for trusting us to help you find a solution. Please find
          below a high-level Effort and Cost estimation based on your
          preferences.
        </p>
      </div>

      <div style="border-bottom: 2px solid #eeeeee">
        <h2 style="text-align: center;margin: 20px 0;font-size: 20px;font-weight: 600;">
          Application Specifications
        </h2>
      </div>

      <div style="border-bottom: 1px solid #eeeeee">
        <table
          width="100%"
          cell-spacing="0"
          cell-padding="0"
          border-collapse:collapse;>
          <thead>
            <tr style="background-color: #2a50eb; color: #ffffff">
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                App Specifications
              </th>
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                User Preferences
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; padding: 10px">
                Application Category
              </td>
              <td style="text-align: center; padding: 10px">${data.step1_domain_data}</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Platforms Selected
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">${dis_platform}</td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Admin Panel</td>
              <td style="text-align: center; padding: 10px">Yes</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Web Application
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
              ${web_application}
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Secondary App</td>
              <td style="text-align: center; padding: 10px">
              ${primary_app_name} ${secondary_app_name}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="border-bottom: 2px solid #eeeeee">
        <h2 style="text-align: center;margin: 20px;font-size: 20px;font-weight: 600;">
          App Version Specifications
        </h2>
      </div>
      <div style="border-bottom: 1px solid #eeeeee">
        <table
          width="100%"
          cell-spacing="0"
          cell-padding="0"
          border-collapse:collapse;>
          <thead>
            <tr style="background-color: #2a50eb; color: #ffffff">
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                App Version Specifications
              </th>
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                Android
              </th>
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                iOS
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; padding: 10px">Latest Version</td>
              <td style="text-align: center; padding: 10px">11.0</td>
              <td style="text-align: center; padding: 10px">14</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Backward Compatibility
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                6.0
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                12
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Screen Sizes</td>
              <td style="text-align: center; padding: 10px">5.0 -> 6.9</td>
              <td style="text-align: center; padding: 10px">4.7 -> 6.5</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Minimum SDK Version
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Marshmallow - Version-6
                <br />API Level -23
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                -
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">
                Maximum SDK Version
              </td>
              <td style="text-align: center; padding: 10px">
                Android 11 - Version-11 <br />
                API Level -30
              </td>
              <td style="text-align: center; padding: 10px">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="background-color: #f7f7f7;padding: 30px;margin-top: 20px;text-align: center;">
        <h4 style="font-weight: bold;margin-top: 0;font-size: 24px;margin-bottom: 5px;">
          Grand Cost
        </h4>
        <h2 style="margin-top: 0;margin-bottom: 5px;color: #2a50eb;font-size: 30px;letter-spacing: 3px;font-weight: 400;">
          ${Math.round(amt_convertd)} ${conversion_data.currency_name}
        </h2>
        <p style="margin-top: 0; margin-bottom: 30px">
          If this is a bit unexpected, we are keen to help you to reduce this cost, Please answer few more questions.
        </p>
        <div style="text-align: center">
          <div style="height: 56px;line-height: 56px;border: 2px solid #2a50eb;background: #f7f7f7;">
            <span class="cx-ttext" style="font-weight: 600; display: block; font-size: 20px">TIMELINE ${Math.round(timeline_val)} Months (approx.)</span>
          </div>
        </div>
      </div>

      <div style="text-align: center;font-size: 20px;font-weight: bold;padding-top: 20px;padding-bottom: 20px;">
        Cost Breakups
      </div>

      <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;">
        <div style="padding: 25px">
          <div style="width: 10%; float: left">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/999a295f-d448-4fff-a663-4183d66d9958/32x32.png"
            />
          </div>
          <div style="width: 90%; float: right">
            <div style="font-size: 20px; font-weight: bold">${data.step1_domain_data}</div>
            <div style="font-size: 12px; color: #2a50eb; font-weight: bold">
            ${Math.round(grandTotalEfforts)} Hours
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a5707e4f-8f14-440d-8c4f-a3d46fed3d6d/38x38.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
          <div style="padding: 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/b837d2d2-b761-4302-bc30-46c2a6b0f9a8/24x24.png"
                style="margin-top: 10px"
              />
            </div>

            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">
                Screen Design
              </div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: bold">
              ${uiscreenhrs} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a5707e4f-8f14-440d-8c4f-a3d46fed3d6d/38x38.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
          <div style="padding: 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/13113dc1-aaef-4979-ac80-7bebaf534efd/17x24.png"
                style="margin-top: 10px"
              />
            </div>
            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">Front End</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: bold">
                ${Math.round(frontend_total_hrs)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;">
          <div style="padding: 25px" width="100%">
            <div style="width: 33%;float: left;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/ca0b98f9-567b-4dde-b165-84a6d8c06db9/21x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Android</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${Math.round(frontend_android_hrs)} hrs
              </div>
            </div>
            <div style="width: 33%; float: right; text-align: center">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/cd7361c4-29eb-438f-871d-ebad79f028d5/24x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Web App</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${Math.round(frontend_web_hrs)} hrs
              </div>
            </div>
            <div style="width: 33%;float: right;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/ac3c063a-b737-4f8a-ba7a-768c98a6fac6/20x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">iOS</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${Math.round(frontend_ios_hrs)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%"></div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 80%;">
          <div style="padding: 25px" width="100%">
            <div width="100%">
              <div style="text-align: right; padding: 0 10px">
                <h5 style="background: #595856;color: #ffffff;text-align: center;padding-top: 10px;padding-bottom: 10px;">
                  Feature List
                </h5>
              </div>
              <div style="text-align: left; padding: 0 10px">
                <ul style="list-style-type:disc;">${modular_list_full}</ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a5707e4f-8f14-440d-8c4f-a3d46fed3d6d/38x38.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;">
          <div style="padding: 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/7567fc10-9141-4c9c-a7d8-964c80048dc3/21x19.png"
                style="margin-top: 10px"
              />
            </div>
            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">Backend</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: bold">
                ${backend_hrs} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;">
          <div style=" display: flex" width="100%">
            <div style="width: 33%;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/64c904e8-8dd9-4dcf-9bb3-9d1fac9d48b7/27x26.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Web Services</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${webservices_hrs} hrs
              </div>
            </div>
            <div style="width: 33%; text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a5b8b471-37ee-4507-928f-be3daf8eef0b/19x25.png "
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Database</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${Math.round(database_hrs)} hrs
              </div>
            </div>
            <div style="width: 33%;text-align: center;border-right: 1px solid #eeeeee;">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a0f2ed45-38e1-46bc-b320-48a3a6f1b544/20x24.png"
                  style="margin-top: 10px"
                />
              <div style="font-size: 14px; font-weight: 700">Admin Panel</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${admin_panel_hrs}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 80%;padding: 0 60px;">
          <div width="50%" style="float: left">
            <div style="text-align: left; padding: 0 10px">
              <h5 style="background: #595856;color: #ffffff;text-align: center;padding: 10px 30px;">
                Basic Features
              </h5>
            </div>
            <div style="text-align: left; padding: 0 10px">
            <ul>
              ${adminpanel_list_basic}
            </ul>
            </div>
          </div>

          <div width="50%" style="float: right">
            <div style="text-align: left; padding: 0 10px">
              <h5 style="background: #595856;color: #ffffff;text-align: center;padding: 10px 30px;">
                Advance Features
              </h5>
            </div>
            <div style="text-align: left; padding: 0 10px">
            <ul>
              ${adminpanel_list_advance}
            </ul>
            </div>
          </div>
        </div>
      </div>

      ${
        secondary_app_estimation != 0 ?
        `<div style="margin-top: 20px">
        <div style="float: left; width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a5707e4f-8f14-440d-8c4f-a3d46fed3d6d/38x38.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
          <div style="padding: 25px" width="100%">
            <div style="width: 10%; float: left">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/cc2d22c5-6ae1-4a6c-af0b-6b5f5e0525ab/12x20.png"
                style="margin-top: 10px"
              />
            </div>
            <div style="width: 90%; float: right">
              <div style="font-size: 20px; font-weight: bold">
                Secondary Apps
              </div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: bold">
                ${Math.round(secondary_app_estimation)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>
      <div style="margin-top: 20px">
        <div style="float: left; width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
          <div style="padding: 25px" width="100%">
            ${output}
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>
      ${secondary_app_modular_list}
        ` : ''
      }

      

      

      <div style="background-color: #f7f7f7;padding: 30px;margin-top: 20px;text-align: center;">
        <h4 style="font-weight: 600;margin-top: 0;font-size: 24px;margin-bottom: 5px;">
          Grand Total
        </h4>
        <h2 style="margin-top: 0;margin-bottom: 5px;font-size: 30px;letter-spacing: 3px;font-weight: 400;color: #2a50eb;">
          ${Math.round(amt_convertd)} ${conversion_data.currency_name}
        </h2>
        <p style="margin-top: 0; margin-bottom: 30px">
          If this is a bit unexpected, we are keen to help you to reduce this
          cost, Please answer a few more questions.
        </p>
      </div>

      <div style="text-align: center">
        <p style="margin: 30px 0">Try With Our Cost Calculator App</p>
        <span>
          <a href="https://play.google.com/store/apps/details?id=com.redbytes.projectcostcalculator&hl=en&gl=US">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/653dbb03-fb0f-4e75-a95a-c149526d95bb/5436x1604.png"
              style="height: 60px; width: 200px"
            />
          </a>
        </span>
        <span>
          <a href="https://apps.apple.com/gb/app/cost-calculator/id1482880672">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/4f466f9c-90d6-4259-87df-ddf9a8bb2872/1990x590.png"
              style="height: 60px; width: 200px"
            />
          </a>
        </span>

        <p style="text-align: center; margin: 30px 0">
          We hope this estimate is to your satisfaction and offers a
          comprehensive picture. For any further queries, we would be happy to
          respond at
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <table style="width: 100%">
          <tr>
              <td style="" valign="bottom">
            <a href="https://www.cloudxperte.com/" target="_blank">
                <img
                    src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/9cfec0a3-e987-4c18-8204-dd7566c48281/30x31.png"
                    style="margin-bottom: -9px;"/>
                <span style="margin-left: 5px;">www.cloudxperte.com</span>
            </a>
        </td>

            <td>
              <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/35e3a74f-0faa-4ecb-a54c-7ac71aec0e62/30x30.png"
              style="margin-bottom: -9px;"/>
              <span style="margin-left: 5px;">+91 81138 62000</span>
            </td>

            <td>
              <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/23566361-0ce0-48ee-a871-a62c95d794e7/31x31.png"
              style="margin-bottom: -9px;"/>
            <span style="margin-left: 5px;">+1 92955 21900</span>
            </td>
          </tr>
        </table>
      </div>

      <div>
        <h2 style="text-align: center;margin-top: 50px;margin-bottom: 10px;font-size: 20px;font-weight: bold;">
          More About App Development
        </h2>
      </div>

      <div style="box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 100%;">
        <div width="100%" style="display: flex; justify-content: center;">
            
            <div style="width: 40%;text-align: center;border: 1px solid #eeeeee;padding: 20px 0;">
                <a href="https://www.redbytes.in/how-much-does-it-cost-to-develop-an-app/" target="_blank">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f3ae7fcf-8653-4ba1-baea-56bb18feacd6/27x50.png"
              style="margin-top: 10px; width: 26px"/>
            <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
              How Much
            </div>
        </a>
          </div>

          <div style="width: 40%;text-align: center;border: 1px solid #eeeeee;padding: 20px 0;">
            <a href="https://www.redbytes.in/how-to-create-an-app-like-udemy/" target="_blank">

                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/533183b4-bf90-460e-8be0-5a8bc47a5a89/243x242.png"
                  style="margin-top: 10px; width: 48px"
                />
                <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
                  How To
                </div>
            </a>
          </div>
        </div>
      </div>

      <div style="margin-top: 50px">
        <h2 style="color: #2a50eb; margin-top: 30px; margin-bottom: 0">
          DISCLAIMER
        </h2>
        <p style="margin-top: 10px">
          We have formulated this model based on Intelligent and Predictive
          analytics and is honed by years of industry experience. We can assure
          you that, based on your present preference, this estimate will be
          about 70-80 % accurate
        </p>
        <span style="color: #2a50eb"
          >Note: This email is generated from App Cost Calculator page -
          CloudXperte
        </span>
      </div>

      <div style="margin-top: 20px" width="100%">
        <div style="float: left; width: 50%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/7a693d2f-6166-40db-b0a2-d95f745c5a52/283x91.png"
            alt="Creating Email Magic"
            height="75"
          />
        </div>
        <div style="float: right; width: 50%; text-align: right">
          <div width="100%">
            <div class="cx-atext" style="text-align: right;margin-right: 5px;float: left;width: 90%;">
              <p style="margin: 0">15, Software Technology Park of India,</p>
              <p style="margin: 0">Chikalthana MIDC,</p>
              <p style="margin: 0">Aurangabad, Maharashtra. 431210</p>
            </div>
            
            <div width="10%" style="float: right">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/109037b9-7454-4f2a-a812-e131afc7e697/31x31.png"
                style="padding-top: 15px"/>
            </div>

          </div>
        </div>
      </div>

      <div style="border-bottom: 2px solid #eeeeee; margin-top: 40px; clear: both;"></div>
    </div>
  </body>
</html>`;

let customer_mail_template_version_red = `<!DOCTYPE html>
<html lang="en">
  <head>
  </head>
  <body
    style="font-family: Overpass, sans-serif;box-sizing: border-box;padding: 0;margin:0;">
    <div class="main-container" style="padding:50px;padding-top:0px">
      <div>
        <div>
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/3acd8747-2022-48cf-99d8-fa02223bcfe8/707x216.png" alt="Creating Email Magic" width="150"/>
          <img src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/1fc7dc6b-b558-40fa-b995-2447bd6cb449/282x90.png" alt="Creating Email Magic" style="float: right" height="75" />
        </div>
      </div>

      <div class="pg-title" style="text-align: right">
        <h2>MOBILE APP COST CALCULATOR</h2>
      </div>

      <div style="border-top: 2px solid #F20101"></div>
      <div style="text-align: center">
        <img src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f37d2286-0b6f-4f40-bf55-5602c0ce53cc/852x508.png" style="width: 550px; margin-top: 20px" alt="image" />
      </div>

      <div style="margin-top: 20px; border-bottom: 1px solid #eeeeee">
        <h2 class="heading" style="text-align: center; color: #F20101">
          Greetings!
        </h2>
        <p style="font-size: 14px;line-height: 25px;padding: 1px 20px;font-weight: 600;">
          Dear ${data.user_name},
        </p>
        <p style="font-size: 14px;line-height: 25px;padding: 1px 20px;font-weight: 500;">
          Thank you for trusting us to help you find a solution. Please find
          below a high-level Effort and Cost estimation based on your
          preferences.
        </p>
      </div>

      <div style="border-bottom: 2px solid #eeeeee">
        <h2 style="text-align: center;margin: 20px 0;font-size: 20px;font-weight: 600;">
          Application Specifications
        </h2>
      </div>

      <div style="border-bottom: 1px solid #eeeeee">
        <table
          width="100%"
          cell-spacing="0"
          cell-padding="0"
          border-collapse:collapse;>
          <thead>
            <tr style="background-color: #F20101; color: #ffffff">
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                App Specifications
              </th>
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                User Preferences
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; padding: 10px">
                Application Category
              </td>
              <td style="text-align: center; padding: 10px">${data.step1_domain_data}</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Platforms Selected
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">${dis_platform}</td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Admin Panel</td>
              <td style="text-align: center; padding: 10px">Yes</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Web Application
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
              ${web_application}
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Secondary App</td>
              <td style="text-align: center; padding: 10px">
              ${secd_app_names}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="border-bottom: 2px solid #eeeeee">
        <h2 style="text-align: center;margin: 20px;font-size: 20px;font-weight: 600;">
          App Version Specifications
        </h2>
      </div>
      <div style="border-bottom: 1px solid #eeeeee">
        <table
          width="100%"
          cell-spacing="0"
          cell-padding="0"
          border-collapse:collapse;>
          <thead>
            <tr style="background-color: #F20101; color: #ffffff">
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                App Version Specifications
              </th>
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                Android
              </th>
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                iOS
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; padding: 10px">Latest Version</td>
              <td style="text-align: center; padding: 10px">11.0</td>
              <td style="text-align: center; padding: 10px">14</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Backward Compatibility
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                6.0
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                12
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Screen Sizes</td>
              <td style="text-align: center; padding: 10px">5.0 -> 6.9</td>
              <td style="text-align: center; padding: 10px">4.7 -> 6.5</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Minimum SDK Version
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Marshmallow - Version-6
                <br />API Level -23
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                -
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">
                Maximum SDK Version
              </td>
              <td style="text-align: center; padding: 10px">
                Android 11 - Version-11 <br />
                API Level -30
              </td>
              <td style="text-align: center; padding: 10px">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="background-color: #f7f7f7;padding: 30px;margin-top: 20px;text-align: center;">
        <h4 style="font-weight: bold;margin-top: 0;font-size: 24px;margin-bottom: 5px;">
          Grand Cost
        </h4>
        <h2 style="margin-top: 0;margin-bottom: 5px;color: #F20101;font-size: 30px;letter-spacing: 3px;font-weight: 400;">
          ${Math.round(amt_convertd)} ${conversion_data.currency_name}
        </h2>
        <p style="margin-top: 0; margin-bottom: 30px">
          If this is a bit unexpected, we are keen to help you to reduce this cost, Please answer few more questions.
        </p>
        <div style="text-align: center">
          <div style="height: 56px;line-height: 56px;border: 2px solid #F20101;background: #f7f7f7;">
            <span class="cx-ttext" style="font-weight: 600; display: block; font-size: 20px">TIMELINE ${Math.round(timeline_val)} Months (approx.)</span>
          </div>
        </div>
      </div>

      <div style="text-align: center;font-size: 20px;font-weight: bold;padding-top: 20px;padding-bottom: 20px;">
        Cost Breakups
      </div>

      <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 60px;">
        <div style="padding: 12px 25px;">
          <div style="width: 10%; float: left">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/92bfbb0a-831d-455a-856f-7de0bb1d36d8/32x32.png"
            />
          </div>
          <div style="width: 90%; float: right">
            <div style="font-size: 20px; font-weight: bold">${data.step1_domain_data}</div>
            <div style="font-size: 12px; color: #F20101; font-weight: bold">
            ${Math.round(grandTotalEfforts)} Hours
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 15px; display: flex">
        <div style="width: 10%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f022be81-8d7d-40b6-92e7-598b62c8fa53/30x30.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 60px;width: 90%;float: right;">
          <div style="padding: 12px 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/14c989c2-5bb2-40a3-bc23-d621edb508db/24x24.png"
                style="margin-top: 10px"
              />
            </div>

            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">
                Screen Design
              </div>
              <div style="font-size: 12px; color: #F20101; font-weight: bold">
              ${uiscreenhrs} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 15px; display: flex">
        <div style="width: 10%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f022be81-8d7d-40b6-92e7-598b62c8fa53/30x30.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 60px;width: 90%;float: right;">
          <div style="padding: 12px 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/29a67025-65e8-4a71-a313-8b104cdee317/26x36.png"
                style="margin-top: 10px"
              />
            </div>
            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">Front End</div>
              <div style="font-size: 12px; color: #F20101; font-weight: bold">
                ${Math.round(frontend_total_hrs)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 0; display: flex">
        <div style="width: 10%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: auto;width: 90%;">
          <div style="padding: 12px 25px" width="100%">
            <div style="width: 33%;float: left;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/6f46607e-2437-4a71-b255-521db2babb06/21x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Android</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${Math.round(frontend_android_hrs)} hrs
              </div>
            </div>
            <div style="width: 33%; float: right; text-align: center">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/d649217b-4b59-497f-ad56-b4d353cec59f/24x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Web App</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${Math.round(frontend_web_hrs)} hrs
              </div>
            </div>
            <div style="width: 33%;float: right;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/b19a6fd8-fc93-4dd7-b300-2a8242390cc8/20x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">iOS</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${Math.round(frontend_ios_hrs)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 0px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 0px; display: flex">
        <div style="width: 10%"></div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 90%;">
          <div style="padding: 12px 25px" width="100%">
            <div width="100%">
              <div style="text-align: right; padding: 0 10px">
                <h5 style="background: #595856;color: #ffffff;text-align: center;padding-top: 10px;padding-bottom: 10px;">
                  Feature List
                </h5>
              </div>
              <div style="text-align: left; padding: 0 10px">
                <ul style="list-style-type:disc;">${modular_list_full}</ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 15px; display: flex">
        <div style="width: 10%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f022be81-8d7d-40b6-92e7-598b62c8fa53/30x30.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 60px;width: 90%;">
          <div style="padding: 12px 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/67452889-614e-475b-8f9e-0d80f6253686/21x19.png"
                style="margin-top: 10px"
              />
            </div>
            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">Backend</div>
              <div style="font-size: 12px; color: #F20101; font-weight: bold">
                ${backend_hrs} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 0px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 0px; display: flex">
        <div style="width: 10%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: auto;width: 90%;">
          <div style=" display: flex" width="100%">
            <div style="width: 33%;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/3c9d11c9-530d-45a2-8f0b-82154359a03a/24x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Web Services</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${Math.round(webservices_hrs)} hrs
              </div>
            </div>
            <div style="width: 33%; text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/e8c42d7f-f637-4a6d-afd7-ed1368c89993/19x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Database</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${Math.round(database_hrs)} hrs
              </div>
            </div>
            <div style="width: 33%;text-align: center;border-right: 1px solid #eeeeee;">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/b1c7b097-c357-4726-993e-9579962b90b3/20x24.png"
                  style="margin-top: 10px"
                />
              <div style="font-size: 14px; font-weight: 700">Admin Panel</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${Math.round(admin_panel_hrs)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 0px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 0px; display: flex">
        <div style="width: 10%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 90%;padding: 0;">
          <div  style="float: left;width: 50%">
            <div style="text-align: left; padding: 0 10px">
              <h5 style="background: #595856;color: #ffffff;text-align: center;padding: 10px 30px;">
                Basic Features
              </h5>
            </div>
            <div style="text-align: left; padding: 0 10px">
              <ul>
                ${adminpanel_list_basic}
              </ul>
            </div>
          </div>

          <div  style="float: left;width: 50%">
            <div style="text-align: left; padding: 0 10px">
              <h5 style="background: #595856;color: #ffffff;text-align: center;padding: 10px 30px;">
                Advance Features
              </h5>
            </div>
            <div style="text-align: left; padding: 0 10px">
              <ul>
                ${adminpanel_list_advance}
              </ul>
            </div>
          </div>
        </div>
      </div>

      ${
        secondary_app_estimation !=0 ?
        `
        <div style="margin-top: 0px">
          <div style="float: left; width: 10%">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f022be81-8d7d-40b6-92e7-598b62c8fa53/30x30.png"
              style="padding-left: 25px; margin-top: 25px"
            />
          </div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 60px;width: 90%;float: right;">
            <div style="padding: 12px 25px" width="100%">
              <div style="width: 10%; float: left">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/1c44ecea-e05b-4202-a5fa-ec676afc4694/12x20.png"
                  style="margin-top: 10px"
                />
              </div>
              <div style="width: 90%; float: right">
                <div style="font-size: 20px; font-weight: bold">
                  Secondary Apps
                </div>
                <div style="font-size: 12px; color: #F20101; font-weight: bold">
                  ${Math.round(secondary_app_estimation)} hrs
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 0px">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
            style="padding: 0 0 0 60%"
          />
        </div>
  
        <div style="margin-top: 0px">
          <div style="float: left; width: 10%">
            <span style="padding-left: 25px; margin-top: 25px"></span>
          </div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: auto;width: 90%;float: left;">
            <div style="padding: 12px 25px" width="100%">${output}</div>
          </div>
        </div>
  
        <div style="margin-top: 0px">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
            style="padding: 0 0 0 60%"
          />
        </div>
  
        ${secondary_app_modular_list}
        `
        : ''
      }


      <div style="background-color: #f7f7f7;padding: 30px;margin-top: 20px;text-align: center;">
        <h4 style="font-weight: 600;margin-top: 0;font-size: 24px;margin-bottom: 5px;">
          Grand Total
        </h4>
        <h2 style="margin-top: 0;margin-bottom: 5px;font-size: 30px;letter-spacing: 3px;font-weight: 400;color: #F20101;">
          ${Math.round(amt_convertd)} ${conversion_data.currency_name}
        </h2>
        <p style="margin-top: 0; margin-bottom: 30px">
          If this is a bit unexpected, we are keen to help you to reduce this
          cost, Please answer a few more questions.
        </p>
      </div>

      <div style="text-align: center">
        <p style="margin: 30px 0">Try With Our Cost Calculator App</p>
        <span>
          <a href="https://play.google.com/store/apps/details?id=com.redbytes.projectcostcalculator&hl=en&gl=US">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/653dbb03-fb0f-4e75-a95a-c149526d95bb/5436x1604.png"
              style="height: 60px; width: 200px"
            />
          </a>
        </span>
        <span>
          <a href="https://apps.apple.com/gb/app/cost-calculator/id1482880672">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/4f466f9c-90d6-4259-87df-ddf9a8bb2872/1990x590.png"
              style="height: 60px; width: 200px"
            />
          </a>
        </span>

        <p style="text-align: center; margin: 30px 0">
          We hope this estimate is to your satisfaction and offers a
          comprehensive picture. For any further queries, we would be happy to
          respond at
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <table style="width: 100%">
          <tr>
            <td style="" valign="bottom">
                <a href="https://www.redbytes.in/" target="_blank">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/ed580ade-ae61-4f9b-95d7-5fc7f9f9e486/30x30.png"
                style="margin-bottom: -9px;"/>
              <span style="margin-left: 5px;">www.redbytes.in</span>
            </a>
            </td>

            <td>
              <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/35e3a74f-0faa-4ecb-a54c-7ac71aec0e62/30x30.png"
              style="margin-bottom: -9px;"/>
              <span style="margin-left: 5px;">+91 8113 869 000</span>
            </td>

            <td>
              <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/c4d830a2-cc39-4dc8-8679-05a8527a939a/30x30.png"
              style="margin-bottom: -9px;"/>
            <span style="margin-left: 5px;">+1 9295521900</span>
            </td>
          </tr>
        </table>
      </div>

      <div>
        <h2 style="text-align: center;margin-top: 50px;margin-bottom: 10px;font-size: 20px;font-weight: bold;">
          More About App Development
        </h2>
      </div>

      <div style="box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 100%;">
        <div width="100%" style="display: flex; justify-content: center;">
          <div style="width: 40%;text-align: center;border: 1px solid #eeeeee;padding: 20px 0;">
            <a href="https://www.redbytes.in/how-much-does-it-cost-to-develop-an-app/" target="_blank">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/95ff66f0-7260-4127-ba67-63d065f78e02/100x192.png"
              style="margin-top: 10px; width: 26px"/>
            <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
              How Much
            </div>
        </a>
          </div>

          <div style="width: 40%;text-align: center;border: 1px solid #eeeeee;padding: 20px 0;">
            <a href="https://www.redbytes.in/how-to-create-an-app-like-udemy/" target="_blank">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/ecff8b2b-32b4-4d09-9700-78865298bd88/243x243.png"
              style="margin-top: 10px; width: 48px"
            />
            <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
              How To
            </div>
        </a>
          </div>
        </div>
      </div>

      <div style="margin-top: 50px">
        <h2 style="color: #F20101; margin-top: 30px; margin-bottom: 0">
          DISCLAIMER
        </h2>
        <p style="margin-top: 10px">
          We have formulated this model based on Intelligent and Predictive
          analytics and is honed by years of industry experience. We can assure
          you that, based on your present preference, this estimate will be
          about 70-80 % accurate
        </p>
        <span style="color: #F20101"
          >Note: This email is generated from App Cost Calculator page -
          Redbytes
        </span>
      </div>

      <div style="margin-top: 20px" width="100%">
        <div style="float: left; width: 50%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/9315d5c0-eac8-44fa-8bc2-ee4388763831/282x90.png"
            alt="Creating Email Magic"
            height="75"
          />
        </div>
        <div style="float: right; width: 50%; text-align: right">
          <div width="100%">
            <div class="cx-atext" style="text-align: right;margin-right: 5px;float: left;width: 90%;">
              <p style="margin: 0">125/2, Sainiketan Colony, kalas Road,</p>
              <p style="margin: 0">Visharant Wadi,</p>
              <p style="margin: 0">Pune, Maharashtra 411015.</p>
            </div>
            
            <div width="10%" style="float: right">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/74801c97-6e6e-440f-b0c2-83bb8f58695f/30x30.png"
                style="padding-top: 15px"/>
            </div>

          </div>
        </div>
      </div>

      <div style="border-bottom: 2px solid #eeeeee; margin-top: 40px; clear: both;"></div>
    </div>
  </body>
</html>`;

let customer_mail_template_version_purple = `<!DOCTYPE html>
<html lang="en">
  <head>
  </head>
  <body
    style="font-family: Overpass, sans-serif;box-sizing: border-box;padding: 0;margin:0;">
    <div class="main-container" style="padding:50px;padding-top:0px">
      <div>
        <div>
          <img src="https://costcalculator.redbytes.in/probytes_logo.png" alt="Creating Email Magic" width="150"/> 
          <img src="https://costcalculator.redbytes.in/header_band.png" alt="Creating Email Magic" style="float: right" height="75" />
        </div>
      </div>

      <div class="pg-title" style="text-align: right">
        <h2>MOBILE APP COST CALCULATOR</h2>
      </div>

      <div style="border-top: 2px solid #491C61"></div>
      <div style="text-align: center">
        <img src="https://costcalculator.redbytes.in/center_icon.png" style="width: 550px; margin-top: 20px" alt="image" />
      </div>

      <div style="margin-top: 20px; border-bottom: 1px solid #eeeeee">
        <h2 class="heading" style="text-align: center; color: #491C61">
          Greetings!
        </h2>
        <p style="font-size: 14px;line-height: 25px;padding: 1px 20px;font-weight: 600;">
          Dear ${data.user_name},
        </p>
        <p style="font-size: 14px;line-height: 25px;padding: 1px 20px;font-weight: 500;">
          Thank you for trusting us to help you find a solution. Please find
          below a high-level Effort and Cost estimation based on your
          preferences.
        </p>
      </div>

      <div style="border-bottom: 2px solid #eeeeee">
        <h2 style="text-align: center;margin: 20px 0;font-size: 20px;font-weight: 600;">
          Application Specifications
        </h2>
      </div>

      <div style="border-bottom: 1px solid #eeeeee">
        <table
          width="100%"
          cell-spacing="0"
          cell-padding="0"
          border-collapse:collapse;>
          <thead>
            <tr style="background-color: #491C61; color: #ffffff">
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                App Specifications
              </th>
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                User Preferences
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; padding: 10px">
                Application Category
              </td>
              <td style="text-align: center; padding: 10px">${data.step1_domain_data}</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Platforms Selected
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">${dis_platform}</td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Admin Panel</td>
              <td style="text-align: center; padding: 10px">Yes</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Web Application
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
              ${web_application}
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Secondary App</td>
              <td style="text-align: center; padding: 10px">
              ${secd_app_names}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="border-bottom: 2px solid #eeeeee">
        <h2 style="text-align: center;margin: 20px;font-size: 20px;font-weight: 600;">
          App Version Specifications
        </h2>
      </div>
      <div style="border-bottom: 1px solid #eeeeee">
        <table
          width="100%"
          cell-spacing="0"
          cell-padding="0"
          border-collapse:collapse;>
          <thead>
            <tr style="background-color: #491C61; color: #ffffff">
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                App Version Specifications
              </th>
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                Android
              </th>
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                iOS
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; padding: 10px">Latest Version</td>
              <td style="text-align: center; padding: 10px">11.0</td>
              <td style="text-align: center; padding: 10px">14</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Backward Compatibility
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                6.0
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                12
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Screen Sizes</td>
              <td style="text-align: center; padding: 10px">5.0 -> 6.9</td>
              <td style="text-align: center; padding: 10px">4.7 -> 6.5</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Minimum SDK Version
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Marshmallow - Version-6
                <br />API Level -23
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                -
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">
                Maximum SDK Version
              </td>
              <td style="text-align: center; padding: 10px">
                Android 11 - Version-11 <br />
                API Level -30
              </td>
              <td style="text-align: center; padding: 10px">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="background-color: #f7f7f7;padding: 30px;margin-top: 20px;text-align: center;">
        <h4 style="font-weight: bold;margin-top: 0;font-size: 24px;margin-bottom: 5px;">
          Grand Cost
        </h4>
        <h2 style="margin-top: 0;margin-bottom: 5px;color: #491C61;font-size: 30px;letter-spacing: 3px;font-weight: 400;">
          ${Math.round(amt_convertd)} ${conversion_data.currency_name}
        </h2>
        <p style="margin-top: 0; margin-bottom: 30px">
          If this is a bit unexpected, we are keen to help you to reduce this cost, Please answer few more questions.
        </p>
        <div style="text-align: center">
          <div style="height: 56px;line-height: 56px;border: 2px solid #491C61;background: #f7f7f7;">
            <span class="cx-ttext" style="font-weight: 600; display: block; font-size: 20px">TIMELINE ${Math.round(timeline_val)} Months (approx.)</span>
          </div>
        </div>
      </div>

      <div style="text-align: center;font-size: 20px;font-weight: bold;padding-top: 20px;padding-bottom: 20px;">
        Cost Breakups
      </div>

      <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 60px;">
        <div style="padding: 12px 25px;">
          <div style="width: 10%; float: left">
            <img
              src="https://costcalculator.redbytes.in/shopping_cart.png"
            />
          </div>
          <div style="width: 90%; float: right">
            <div style="font-size: 20px; font-weight: bold">${data.step1_domain_data}</div>
            <div style="font-size: 12px; color: #491C61; font-weight: bold">
            ${Math.round(grandTotalEfforts)} Hours
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 15px; display: flex">
        <div style="width: 10%">
          <img
            src="https://costcalculator.redbytes.in/Circle.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 60px;width: 90%;float: right;">
          <div style="padding: 12px 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="https://costcalculator.redbytes.in/screen_design.png"
                style="margin-top: 10px"
              />
            </div>

            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">
                Screen Design
              </div>
              <div style="font-size: 12px; color: #491C61; font-weight: bold">
              ${uiscreenhrs} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 15px; display: flex">
        <div style="width: 10%">
          <img
            src="https://costcalculator.redbytes.in/Circle.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 60px;width: 90%;float: right;">
          <div style="padding: 12px 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="https://costcalculator.redbytes.in/frontend.png"
                style="margin-top: 10px"
              />
            </div>
            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">Front End</div>
              <div style="font-size: 12px; color: #491C61; font-weight: bold">
                ${Math.round(frontend_total_hrs)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 0; display: flex">
        <div style="width: 10%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: auto;width: 90%;">
          <div style="padding: 12px 25px" width="100%">
            <div style="width: 33%;float: left;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="https://costcalculator.redbytes.in/android.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Android</div>
              <div style="font-size: 12px; color: #491C61; font-weight: 600">
                ${Math.round(frontend_android_hrs)} hrs
              </div>
            </div>
            <div style="width: 33%; float: right; text-align: center">
              <img
                src="https://costcalculator.redbytes.in/website.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Web App</div>
              <div style="font-size: 12px; color: #491C61; font-weight: 600">
                ${Math.round(frontend_web_hrs)} hrs
              </div>
            </div>
            <div style="width: 33%;float: right;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="https://costcalculator.redbytes.in/apple.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">iOS</div>
              <div style="font-size: 12px; color: #491C61; font-weight: 600">
                ${Math.round(frontend_ios_hrs)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 0px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 0px; display: flex">
        <div style="width: 10%"></div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 90%;">
          <div style="padding: 12px 25px" width="100%">
            <div width="100%">
              <div style="text-align: right; padding: 0 10px">
                <h5 style="background: #595856;color: #ffffff;text-align: center;padding-top: 10px;padding-bottom: 10px;">
                  Feature List
                </h5>
              </div>
              <div style="text-align: left; padding: 0 10px">
                <ul style="list-style-type:disc;">${modular_list_full}</ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 15px; display: flex">
        <div style="width: 10%">
          <img
            src="https://costcalculator.redbytes.in/Circle.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 60px;width: 90%;">
          <div style="padding: 12px 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="https://costcalculator.redbytes.in/web_services.png"
                style="margin-top: 10px"
              />
            </div>
            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">Backend</div>
              <div style="font-size: 12px; color: #491C61; font-weight: bold">
                ${backend_hrs} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 0px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 0px; display: flex">
        <div style="width: 10%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: auto;width: 90%;">
          <div style=" display: flex" width="100%">
            <div style="width: 33%;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="https://costcalculator.redbytes.in/web_service_circle.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Web Services</div>
              <div style="font-size: 12px; color: #491C61; font-weight: 600">
                ${Math.round(webservices_hrs)} hrs
              </div>
            </div>
            <div style="width: 33%; text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="https://costcalculator.redbytes.in/database_icon.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Database</div>
              <div style="font-size: 12px; color: #491C61; font-weight: 600">
                ${Math.round(database_hrs)} hrs
              </div>
            </div>
            <div style="width: 33%;text-align: center;border-right: 1px solid #eeeeee;">
                <img
                  src="https://costcalculator.redbytes.in/administrator.png"
                  style="margin-top: 10px"
                />
              <div style="font-size: 14px; font-weight: 700">Admin Panel</div>
              <div style="font-size: 12px; color: #491C61; font-weight: 600">
                ${Math.round(admin_panel_hrs)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 0px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 0px; display: flex">
        <div style="width: 10%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 90%;padding: 0;">
          <div  style="float: left;width: 50%">
            <div style="text-align: left; padding: 0 10px">
              <h5 style="background: #595856;color: #ffffff;text-align: center;padding: 10px 30px;">
                Basic Features
              </h5>
            </div>
            <div style="text-align: left; padding: 0 10px">
              <ul>
                ${adminpanel_list_basic}
              </ul>
            </div>
          </div>

          <div  style="float: left;width: 50%">
            <div style="text-align: left; padding: 0 10px">
              <h5 style="background: #595856;color: #ffffff;text-align: center;padding: 10px 30px;">
                Advance Features
              </h5>
            </div>
            <div style="text-align: left; padding: 0 10px">
              <ul>
                ${adminpanel_list_advance}
              </ul>
            </div>
          </div>
        </div>
      </div>

      ${
        secondary_app_estimation != 0 ?
        `<div style="margin-top: 0px">
        <div style="float: left; width: 10%">
          <img
            src="https://costcalculator.redbytes.in/Circle.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 60px;width: 90%;float: right;">
          <div style="padding: 12px 25px" width="100%">
            <div style="width: 10%; float: left">
              <img
                src="https://costcalculator.redbytes.in/mobile.png"
                style="margin-top: 10px"
              />
            </div>
            <div style="width: 90%; float: right">
              <div style="font-size: 20px; font-weight: bold">
                Secondary Apps
              </div>
              <div style="font-size: 12px; color: #491C61; font-weight: bold">
                ${Math.round(secondary_app_estimation)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 0px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 0px">
        <div style="float: left; width: 10%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: auto;width: 90%;float: left;">
          <div style="padding: 12px 25px" width="100%">${output}</div>
        </div>
      </div>

      <div style="margin-top: 0px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      ${secondary_app_modular_list}
        `
        : ''
      }

      

      <div style="background-color: #f7f7f7;padding: 30px;margin-top: 20px;text-align: center;">
        <h4 style="font-weight: 600;margin-top: 0;font-size: 24px;margin-bottom: 5px;">
          Grand Total
        </h4>
        <h2 style="margin-top: 0;margin-bottom: 5px;font-size: 30px;letter-spacing: 3px;font-weight: 400;color: #491C61;">
          ${Math.round(amt_convertd)} ${conversion_data.currency_name}
        </h2>
        <p style="margin-top: 0; margin-bottom: 30px">
          If this is a bit unexpected, we are keen to help you to reduce this
          cost, Please answer a few more questions.
        </p>
      </div>

      <div style="text-align: center">
        <p style="margin: 30px 0">Try With Our Cost Calculator App</p>
        <span>
          <a href="https://play.google.com/store/apps/details?id=com.redbytes.projectcostcalculator&hl=en&gl=US">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/653dbb03-fb0f-4e75-a95a-c149526d95bb/5436x1604.png"
              style="height: 60px; width: 200px"
            />
          </a>
        </span>
        <span>
          <a href="https://apps.apple.com/gb/app/cost-calculator/id1482880672">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/4f466f9c-90d6-4259-87df-ddf9a8bb2872/1990x590.png"
              style="height: 60px; width: 200px"
            />
          </a>
        </span>

        <p style="text-align: center; margin: 30px 0">
          We hope this estimate is to your satisfaction and offers a
          comprehensive picture. For any further queries, we would be happy to
          respond at
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <table style="width: 100%">
          <tr>
            <td style="" valign="bottom">
                <a href="https://www.probytes.net/" target="_blank">
              <img
                src="https://costcalculator.redbytes.in/www_logo.png"
                style="margin-bottom: -9px;"/>
              <span style="margin-left: 5px;">www.probytes.net</span>
            </a>
            </td>

            <td>
              <img
              src="https://costcalculator.redbytes.in/whatsapp_logo.png"
              style="margin-bottom: -9px;"/>
              <span style="margin-left: 5px;">+91 8113 869 000</span>
            </td>

            <td>
              <img
              src="https://costcalculator.redbytes.in/calling.png"
              style="margin-bottom: -9px;"/>
            <span style="margin-left: 5px;">+1 9295521900</span>
            </td>
          </tr>
        </table>
      </div>

      <div>
        <h2 style="text-align: center;margin-top: 50px;margin-bottom: 10px;font-size: 20px;font-weight: bold;">
          More About App Development
        </h2>
      </div>

      <div style="box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 100%;">
        <div width="100%" style="display: flex; justify-content: center;">
          <div style="width: 40%;text-align: center;border: 1px solid #eeeeee;padding: 20px 0;">
            <a href="https://www.probytes.net/blog/category/how-much/" target="_blank">
            <img
              src="https://costcalculator.redbytes.in/big_doller.png"
              style="margin-top: 10px; width: 26px"/>
            <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
              How Much
            </div>
        </a>
          </div>

          <div style="width: 40%;text-align: center;border: 1px solid #eeeeee;padding: 20px 0;">
            <a href="https://www.probytes.net/blog/category/how-to/" target="_blank">
            <img
              src="https://costcalculator.redbytes.in/setting.png"
              style="margin-top: 10px; width: 48px"
            />
            <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
              How To
            </div>
        </a>
          </div>
        </div>
      </div>

      <div style="margin-top: 50px">
        <h2 style="color: #491C61; margin-top: 30px; margin-bottom: 0">
          DISCLAIMER
        </h2>
        <p style="margin-top: 10px">
          We have formulated this model based on Intelligent and Predictive
          analytics and is honed by years of industry experience. We can assure
          you that, based on your present preference, this estimate will be
          about 70-80 % accurate
        </p>
        <span style="color: #491C61"
          >Note: This email is generated from App Cost Calculator page -
          Redbytes
        </span>
      </div>

      <div style="margin-top: 20px" width="100%">
        <div style="float: left; width: 50%">
          <img
            src="https://costcalculator.redbytes.in/bottom_header.png"
            alt="Creating Email Magic"
            height="75"
          />
        </div>
        <div style="float: right; width: 50%; text-align: right">
          <div width="100%">
            <div class="cx-atext" style="text-align: right;margin-right: 5px;float: left;width: 90%;">
              <p style="margin: 0">125/2, Sainiketan Colony, kalas Road,</p>
              <p style="margin: 0">Visharant Wadi,</p>
              <p style="margin: 0">Pune, Maharashtra 411015.</p>
            </div>
            
            <div width="10%" style="float: right">
              <img
                src="https://costcalculator.redbytes.in/location_icon.png"
                style="padding-top: 15px"/>
            </div>

          </div>
        </div>
      </div>

      <div style="border-bottom: 2px solid #eeeeee; margin-top: 40px; clear: both;"></div>
    </div>
  </body>
</html>`;

let pdf_file_path = '';

  if(template_version == "red"){
    console.log('inside if for red version');
    pdf_file_path = await html_to_pdf(file_name, customer_mail_template_version_red,origin);

  } else if(template_version == "purple"){
    pdf_file_path = await html_to_pdf(file_name, customer_mail_template_version_purple,origin);

  } else{
    pdf_file_path = await html_to_pdf(file_name, customer_mail_template,origin);

  }
  console.log('pdf_file_path = ',pdf_file_path);
  // =========================================== 
  var sqlquery = 'INSERT INTO app_cost_calculator (user_id, domain_id, is_android, is_ios, is_web, functional_features, non_functional_features, admin_features, ff_basic_list, ff_advance_list, nff_basic_list, nff_advance_list, adm_basic_list, adm_advance_list, frontend_efforts, android_efforts, ios_efforts, web_efforts, db_efforts,	webservices_efforts, adm_panel_efforts, backend_efforts, secondaryapp_efforts, other_app_names, total_cost, total_efforts, is_vendor_app,	is_delivery_app, currency_code, modular_features, secondaryapp_modular_features, secondaryapp_nonfunctional_features ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )';
  var params = [user_id, step1_domain_data, android, ios, web, functionalFeatures, nonFunctionalFeatures, adminPanelFeatures, functionalFeaturesBasic, functionalFeaturesAdvance, nonFunctionalFeaturesBasic, nonFunctionalFeaturesAdvance, adminPanelFeaturesBasic, adminPanelFeaturesAdvance, Math.round(frontend_total_hrs), Math.round(frontend_android_hrs), Math.round(frontend_ios_hrs), Math.round(frontend_web_hrs), Math.round(database_hrs), webservices_hrs, admin_panel_hrs, backend_hrs, Math.round(data.secondary_app_estimation), secd_app_names, Math.round(amt_convertd), grandTotalEfforts, app_primary, app_secondary, conversion_data.currency_name, JSON.stringify(modular_feature), JSON.stringify(modular_feature_for_secondaryapps), JSON.stringify(nonfunctional_features_for_secondaryapp) ];
  var rows = await db.dbQuery(sqlquery, params);
  
  // const SENDGRID_APY_KEY = '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';
  const SENDGRID_APY_KEY = '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';
  sgMail.setApiKey(SENDGRID_APY_KEY);
  let theme_template_id = ''
  let to_email_id = '';
  if(template_version == 'red'){
    // theme_template_id = 'd-abf2a645b7bc49a188b9d6897fe7d5de'
    theme_template_id = 'd-a83ad33e0ec4461497bd12e90e01d15b'
    // to_email_id = 'info@redbytes.in'
    to_email_id = mail_sender
  }else if(template_version == 'purple'){
    theme_template_id = 'd-84bcc786a86d4196bacc284747c9c37a'
    to_email_id = mail_sender
  } else{
    // theme_template_id = 'd-f971102512bf466f98a46bc21446dec1';
    theme_template_id = 'd-52b69a7d99fd473abae3a35030ebb109';
    // to_email_id = 'info@cloudxperte.com'
    to_email_id = mail_sender
  }

  // console.log("mail-user======= new",data.user_email)
  request(pdf_file_path, { encoding: null }, (err, res, body) => {
    if (err) { return err; }
    if (body) {
      const textBuffered = Buffer.from(body);
      console.log("<mail_subject>>>>>>>>>>>>>save-contact-info>>>>>", mail_subject)
    const msg = {
      to: data.user_email, // Change to your recipient
      from: to_email_id, // Change to your verified sender
      subject: mail_subject,
      templateId: theme_template_id,   // set template ID
      dynamicTemplateData: {      // send required inputs/keys here
        rb_user_name: data.user_name,
        mail_subject,
        catagory_text: data.step1_domain_data,
        selected_platform: dis_platform,
        admin_panel: 'Yes',   // need inputs
        web_application: (web == 1) ? 'Yes' : 'No',   // need inputs  based on web platform selection
        secondary_app: secd_app_names,

        first_app_link:"http://cdn.mcauto-images-production.sendgrid.net/42edd67b9a40a040/748477c0-30ff-46bc-91a6-0eda6ac353c6/24x19.png",
        second_app_link:"http://cdn.mcauto-images-production.sendgrid.net/42edd67b9a40a040/765883d1-d691-441a-ad3d-d4abf9acc6ff/25x22.png",

        grand_cost: Math.round(amt_convertd)+' '+conversion_data.currency_name,  // round off the val
        timeline: Math.round(timeline_val) + ' Months',// ref google
        approx_cost: (Math.round(amt_convertd) - 3455)+ ' '+conversion_data.currency_name, // skip this
        category_name: data.step1_domain_data,
        total_effort: Math.round(grandTotalEfforts),
        screen_design_effort: uiscreenhrs,
        front_end_effort: Math.round(frontend_total_hrs),
        android_effort: Math.round(frontend_android_hrs),
        ios_effort: Math.round(frontend_ios_hrs),
        web_app_effort:Math.round(frontend_web_hrs),
        database_effort: Math.round(database_hrs),
        module_list: module_list_full,

        backend_effort: backend_hrs,
        web_services_effort: Math.round(webservices_hrs),
        admin_panel_effort: Math.round(admin_panel_hrs),
        adminpanel_basic_features: adminpanel_list_basic,
        adminpanel_advance_features: adminpanel_list_advance,
        adminpanel_module_list:admin_module_list_full,

        secondary_app_effort: Math.round(secondary_app_estimation) || 0,
        secondary_app_selected,
        secondary_app_details : output_in_email,
        module_list_secondary_app:secondaryapp_module_list_full,
        basic_feature_list_functional_features:functional_list_basic,
        advance_feature_list_functional_features:functional_list_advance,
        basic_feature_list_non_functional_features:nonfunctional_list_basic,
        advance_feature_list_non_functional_features:nonfunctional_list_advance,

        // reduction details
        user_inputs_1:"",
        before_document:"-",
        after_document:"-",
      },
      attachments: [
        {
          content: textBuffered.toString('base64'),
          filename: `${mail_attachment_name}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
          content_id: 'mytext',
        },
      ],
    }
    sgMail
      .send(msg)
      .then((response) => {
        console.log('mail sent');
        console.log("mail-response new======= ",response)
    })
      .catch((error) => {
        console.log('mail not sent');
    })
      }
});

// save lead in CRM
// array to string inputs
var functionalFeaturesBasic_arr = step3_feature_data.basic_feature;
var functionalFeaturesAdvance_arr = step3_feature_data.advance_feature;
const functional_features = functionalFeaturesBasic_arr.concat(functionalFeaturesAdvance_arr);  
var current_date = new Date().toJSON().slice(0,10);  
var today = new Date(); 
var current_time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var current_date_for_enq = current_date+' '+current_time;
console.log("dis_platform end:::",dis_platform);

var res_status = false;
var res_msg = '';
var options_inputs = {
  'method': 'POST',
  'url': 'https://admin.officecaller.com/api/leads/website_lead/',
  'headers': {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    "title": data.user_name,
    "first_name": data.user_name,
    "email": data.user_email,
    "phone": data.user_contact,
    "city": geo_data.city_name+', '+geo_data.country_name,
    "state": "",
    "country": geo_data.country_name, // get this dynamic
    "address_line": "",
    "latitude": "46412",
    "longitude": "12345",
    "contact_lead": "-",
    "app_category": data.step1_domain_data,
    "category_text": data.step1_domain_data,
    "app_platform": dis_platform,
    "cross_platfrom_status": "Yes",
    "which_cross_platform": "Native",
    "grand_cost": Math.round(amt_convertd)+' '+conversion_data.currency_name,
    "enq_date": current_date_for_enq,
    "favourite": "favourite here",
    "enq_through": "app OR web",  // need input
    "enq_from": source_and_medium_url,
    "enquiryfrom": source_and_medium_url,
    "country_code": geo_data.flag_code,
    "choosen_approach": "Native",
    "choosen_devices": "Smartphones",
    "choosen_screen_count": 10,   // need inputs
    "choosen_login_methods": [],  // need inputs
    "choosen_features": functional_features,
    "choosen_language": "Multiple", 
    "choosen_admin": "Yes ",  
    "admin_efforts": admin_panel_hrs,
    "choosen_webapp": (web == 1)?"Yes":"No",
    // "secondary_app": (app_primary == 1 || app_secondary == 1)?"No":"Yes", 
    "secondary_app": other_apps.length > 0 ?"Yes":"No", 
    "screen_efforts": uiscreenhrs,
    "webservices": Math.round(webservices_hrs),
    "webapp_efforts": Math.round(frontend_web_hrs),
    "ios_efforts": Math.round(frontend_ios_hrs),
    "android_efforts": Math.round(frontend_android_hrs),
    "crossplatform_efforts": 0,
    "secondary_app_efforts": Math.round(data,secondary_app_estimation),
    "features_efforts": 0,    // need inputs
    "database_efforts": Math.round(database_hrs),
    "grand_total_efforts": Math.round(grandTotalEfforts),
    "approx_cost": Math.round(grandTotalEfforts)+ ' '+conversion_data.currency_name,  
    "timeline_month": Math.round(timeline_val)+' Months',    
    "user_comment": data.user_message,
    "mail_date": current_date_for_enq,
    "apikey": "7dac0fcac909b349"
  })

};
console.log("options_inputs",options_inputs.body);
request(options_inputs, function (error, response) {
  if (error){
    console.log("CRM Entry error",error.message)
    throw new Error(error);
  } 
  res_msg = response.body;
  console.log("CRM Entry response",response.body)
  res_status = true;
}); 
  var result = {
    status: "all ok with api v10",
    CRM_Entry:res_status,
    screenDesignHours: uiscreenhrs,    // ok
    frontend: {
      totalHoursFrontend: frontend_total_hrs.toFixed(2),   // ok
      platforms: frontendPlatForms,   // ok
      functionalFeatures: step3_feature_data,   // ok
      nonFunctionalFeatures: step4_NonFunctional_data   // ok
    },
    backend: {
      totalHours: backend_hrs.toFixed(2),   // ok
      platforms: backendPlatforms,   // ok
      functionalFeatures: adminPanel_data   // ok
    },
    secondaryApp: {
      // totalHours: Math.round((data.secondary_app_estimation ? data.secondary_app_estimation : 0 )+( data.tertiary_app_estimation ? data.tertiary_app_estimation : 0)),   // ok
      totalHours: request_from == "app" ? secondaryAppPlatforms.reduce((acc,cur)=>acc + cur.hours,0) : data.secondary_app_estimation || 0  +  data.tertiary_app_estimation || 0,
      platforms: secondaryAppPlatforms
    },
    totalEfforts: grandTotalEfforts.toFixed(2),
    grandTotalCost: amt_convertd.toFixed(2),
    currencyName:conversion_data.currency_name,
    user_id: user_id,  
    module_list: modl_list1,
    module_list_secondaryapp: modl_list2,
    module_list_secondaryapps: {
      primary_app_modules:[...modl_list1],
      secondary_app_modules:[...modl_list2],
      tertiary_app_modules:[...modl_list3]
    },
    module_list_adminpanel:admin_modules,
    domain_img: 'https://www.redbytes.co.uk/wp-content/themes/redbytes_uk/images/' + selectedDomainSlug + '.png'
  }
  console.log(result);
  return result;
}

const getCostReductionDetailsCX = async (data, user_id, pure_ip, template_version,origin, mail_sender,mail_subject,mail_attachment_name,utm_source) => {
  console.log('called for getCostReductionDetailsCX');
  let remote_ip = '118.185.160.93';   // change this later 

  const geo_data = await getGeoDetails(pure_ip);
  const conversion_data = await getConversionDetails(geo_data.currency_name, totalCost);
  
  console.log("----------------Reduction API-----------------");
  console.log("pure_ip",pure_ip);
  console.log("remote_ip",remote_ip);
  console.log("geo_data",geo_data);
  console.log("conversion_data",conversion_data);
  console.log("----------------Reduction API-----------------");


  // var amt_convertd = conversion_data.converted_amt;
  // var currency_rate_value = conversion_data.currency_rate;

  let sel_domain_slug = data.domian_slug;
  console.log('>>>>>>>>>>>'+sel_domain_slug);
  // collect the data
  var totalCost = data.totalCost;
  var selectedPlatforms = '';
  var screenDesignStatus = data.screenDesignStatus;
  console.log('>>>>>>>>>>>>>>>'+screenDesignStatus);
  var selectedTechnology = data.selectedTechnology;
  var pltf_length = data.selectedPlatforms.length
  if(pltf_length > 1){
    selectedPlatforms = data.selectedPlatforms.join(', ');
    // selectedPlatforms = data.selectedPlatforms;
  } else{
    selectedPlatforms = data.selectedPlatforms[0];
  }
  // var OtherAppData = ["Secondary_app"];
  // var sec_app_length = OtherAppData.length; // set this also
  var sec_app_length = data.selectedOtherApp.length || 0; // set this also
  let rd_other_apps_selected = data.selectedOtherApp;
  let splitted_other_app = []
  let is_primary = '';
  let is_secondary = '';
  let other_app_name = '';
  console.log(rd_other_apps_selected);
  var selectedOtherApp = '';
  if(sec_app_length == 0 ){
    selectedOtherApp = '-';
  } else if(sec_app_length == 1){
    if(data.OtherAppData == "primary_app"){
      is_primary = "primary_app";
    } else if(data.OtherAppData == "Secondary_app"){
      is_secondary = "Secondary_app";
    }
    selectedOtherApp = data.OtherAppData;
  } else if(sec_app_length > 1){
    selectedOtherApp = data.OtherAppData.join(', ');
    is_primary = "primary_app";
    is_secondary = "Secondary_app";
  }

  switch (sel_domain_slug) {
    case 'accounting':
      if(is_primary == 'primary_app'){
        other_app_name += ' Driver App ';
      }
      if(is_secondary == 'Secondary_app'){
        other_app_name += ' Transporter App ';
      }
      break;
    case 'e-commerce-shopping-apps':
    case 'food-delivery':
    case 'service-apps-eg-urbanclap':
      if(is_primary == 'primary_app'){
        other_app_name += ' Vendor App ';
      }
      if(is_secondary == 'Secondary_app'){
        other_app_name += ' Delivery App ';
      }
      break;
    case 'education-and-e-learning':
      if(is_primary == 'primary_app'){
        other_app_name += ' Student App ';
      }
      if(is_secondary == 'Secondary_app'){
        other_app_name += ' Teacher App ';
      }
      break;
    case 'lifestyle-health-and-fitness':
    case 'ngo-fundraising':
      if(is_primary == 'primary_app'){
        other_app_name += ' Coach App ';
      }
      if(is_secondary == 'Secondary_app'){
        other_app_name += ' Manager App ';
      }
      break;
    case 'real-estate':
      if(is_primary == 'primary_app'){
        other_app_name += ' Broker App ';
      }
      if(is_secondary == 'Secondary_app'){
        other_app_name += ' Manager App ';
      }
      break;
     case 'social-networking-social-media-sharing':
      if(is_primary == 'primary_app'){
        other_app_name += ' Merchant App ';
      }
      break;
    case 'travel-booking':
      if(is_primary == 'primary_app'){
        other_app_name += ' Vendor App ';
      }
      break;
    case 'transport-logistics-management':
      if(is_primary == 'primary_app'){
        other_app_name += ' Driver App ';
      }
      if(is_secondary == 'Secondary_app'){
        other_app_name += ' Transporter App ';
      }
      break;
    
    default:
      other_app_name = '';
      break;
  }

  var selectedTimeline = data.selectedTimeline;
  var finalCostReduced = data.finalCostReduced;
  var finaleffortsInHrs = data.finaleffortsInHrs;
  var savedAmount = data.savedAmount;
  var user_id = data.user_id;

  // collect all costs
  var screenDesignReducedCost = Math.round(totalCost)+'-'+Math.round(data.screenDesignReducedCost);
  var platformReducedCost = Math.round(data.screenDesignReducedCost)+'-'+Math.round(data.platformReducedCost);
  var technologyReducedCost = Math.round(data.platformReducedCost)+'-'+Math.round(data.technologyReducedCost);
  var otherAppReducedCost = Math.round(data.technologyReducedCost)+'-'+Math.round(data.otherAppReducedCost);
  var timelineReducedCost = Math.round(data.otherAppReducedCost)+'-'+Math.round(data.timelineReducedCost);
  let is_reduced = true;

  // update record with reduced cost
  var sqlquery = 'UPDATE app_cost_calculator SET rd_screen_design = ?, rd_screen_design_cost = ?, rd_platform_selected = ?, rd_platform_cost = ?, rd_tech_selected = ?, rd_tech_cost = ?, rd_other_apps_selected = ?, rd_otherapp_cost = ?, rd_timeline_selected = ?, hours_after_reduction = ?, cost_after_reduction = ?, saved_amount = ? where user_id = ?';
  var params = [ screenDesignStatus, screenDesignReducedCost, selectedPlatforms, platformReducedCost, selectedTechnology, technologyReducedCost, other_app_name, otherAppReducedCost, selectedTimeline, finaleffortsInHrs, finalCostReduced, savedAmount, user_id];  
  var rows = await db.dbQuery(sqlquery, params);

  // get phase - 1 details from database
  var qry_select = 'SELECT * FROM `app_cost_calculator` LEFT JOIN users on app_cost_calculator.user_id = users.user_id WHERE app_cost_calculator.user_id = ?';
  var input_params = [ user_id ];
  var estm_result = await db.dbQuery(qry_select, input_params);

  console.log("estm_result from DB",estm_result);

    // set functional features - basic list
    var functional_list_basic = "";
    let fnb_list = (estm_result[0].ff_basic_list).split(", ")
    fnb_list.map(item => {
      functional_list_basic += "<li>"+item+"</li>"
    } )
  
    // set functional features - advance list
    var functional_list_advance = "";
    let fnad_list = (estm_result[0].ff_advance_list).split(", ")
    fnad_list.map(item => {
      functional_list_advance += '<li>'+item+'</li>'
    } )
  
    // set non-functional features - basic list
    var nonfunctional_list_basic = "";
    let nfnb_list = (estm_result[0].nff_basic_list).split(", ")
    nfnb_list.map(item => {
      nonfunctional_list_basic += '<li>'+item+'</li>'
    } )
  
    // set non-functional features - advance list
    var nonfunctional_list_advance = "";
    let nfnad_list = (estm_result[0].nff_advance_list).split(", ")
    nfnad_list.map(item => {
      nonfunctional_list_advance += '<li>'+item+'</li>'
    } )
  
    // set admin-panel features - basic list
    var adminpanel_list_basic = "";
    let admb_list = (estm_result[0].adm_basic_list).split(", ")
    admb_list.map(item => {
      adminpanel_list_basic += '<li>'+item+'</li>'
    } )
  
    // set admin-panel features - advance list
    var adminpanel_list_advance = "";
    let admad_list = (estm_result[0].adm_advance_list).split(", ")
    admad_list.map(item => {
      adminpanel_list_advance += '<li>'+item+'</li>'
    } ) 

  console.log(estm_result[0].domain_id);  // ok
  var otherapps = [];
  var primary_app_name = '';
  var secondary_app_name = '';
  if(estm_result[0].other_app_names != ''){
    otherapps = (estm_result[0].other_app_names).split(',');
    primary_app_name = (!otherapps[0])?'':otherapps[0];
    secondary_app_name = (!otherapps[1])?'':otherapps[1];
  }
  
  // send email on successful reduction phase
  var dis_platform = '';
  if(estm_result[0].is_android == 1){
    dis_platform += 'Android, ';
  }
  if(estm_result[0].is_ios == 1){
    dis_platform += 'iOS, ';
  }
  if(estm_result[0].is_web == 1){
    dis_platform += 'Web, ';
  }
  // var data_pdf_path = await fetchGetMethod('save_pdf?user_id=' + user_id);
  // console.log(data_pdf_path);
  var uiscreenhrs = 150;

  var before_document = Math.round(totalCost);
  var after_document = Math.round(data.screenDesignReducedCost);

  var before_cloud_service = after_document;
  var after_cloud_service = Math.round(data.platformReducedCost);

  var before_Tech_service = after_cloud_service;
  var after_Tech_service = Math.round(data.technologyReducedCost);

  var before_screen_deisgn = after_Tech_service;
  var after_screen_deisgn = Math.round(data.otherAppReducedCost);
  console.log(data.features_modules);

  let modules_selected = ''
  console.log("features_modules from reduction API ==>",data.features_modules)
  let module_list_arr = Object.keys(data.features_modules)
  module_list_arr.map(item => {
    // console.log(item+' - ');
    modules_selected += '<li>'+item+'</li>'
  } )

  // modular feature list
  let modular_list_full = "";
  // let module_arr = JSON.parse(estm_result[0].modular_features);
  // Object.keys(module_arr).map((item)=>{
  //   modular_list_full += "<li>"+item;
  //   modular_list_full += "<ul>";
  //   for (const bs of module_arr[item].basic_list) {
  //     modular_list_full += "<li>"+bs+"</li>";
  //   }

  //   // for (const advs of module_arr[item].advance_list) {
  //   //   modular_list_full += "<li>"+advs+"</li>";
  //   // }
  //   modular_list_full += "</ul></li>";
  // })  

  var before_timeline_service = after_screen_deisgn;
  var after_timeline_service = Math.round(data.timelineReducedCost);
  let appefforts_one = 0;
  let appefforts_two = 0;
  var secondary_app_selected = false;
  var timeline_val = estm_result[0].total_efforts / 730;   // 730 hrs for a month
  let web_application = (estm_result[0].is_web == 1) ? 'Yes' : 'No';
  if(estm_result[0].is_vendor_app == 1 && estm_result[0].is_delivery_app == 1){
    appefforts_one = estm_result[0].secondaryapp_efforts / 2;
    appefforts_two = estm_result[0].secondaryapp_efforts / 2;
} else if(estm_result[0].is_vendor_app == 1 && estm_result[0].is_delivery_app == 0){
    appefforts_one = estm_result[0].secondaryapp_efforts;
} else if(estm_result[0].is_vendor_app == 0 && estm_result[0].is_delivery_app == 1){
    appefforts_two = estm_result[0].secondaryapp_efforts;
}else{
  if(estm_result[0]?.other_app_names != ''){

    otherapps = (estm_result[0]?.other_app_names).split(',');

    if(otherapps?.length == 1){
      appefforts_one = estm_result[0]?.secondaryapp_efforts;
      appefforts_two = 0;
      secondary_app_selected = true
    }else if(otherapps?.length == 2){
      appefforts_one = estm_result[0]?.secondaryapp_efforts / 2;
      appefforts_two = estm_result[0]?.secondaryapp_efforts / 2;
      secondary_app_selected = true
    }else{
      appefforts_one = 0;
      appefforts_two = 0;
    }
  
  }else{
    appefforts_one = 0;
    appefforts_two = 0;
  }
}
let secondary_app_details_one = ``;
let secondary_app_details_two = ``;
let secondary_app_complete_details = ``


if(primary_app_name != ''){
  secondary_app_details_one += `
    <div style="width: 50%;float: left;text-align: center;border-right: 1px solid #eeeeee;">
      <img
        src="https://costcalculator.redbytes.in/sec_app_${template_version == 'red' ? 'rb' : template_version == 'purple' ? 'pb' : 'cx'}.png"
        width="25px"
        height="27px"
        style="margin-top: 10px"
      />
      <div style="font-size: 14px; font-weight: 700">${primary_app_name}</div>
      <div style="font-size: 12px; color: ${ template_version == 'red' ? '#F20101' : template_version == 'purple' ? '#491C61' : '#2a50eb'}; font-weight: 600">
        ${Math.round(appefforts_one)} hrs
      </div>
    </div>
  `
}

if(secondary_app_name != ''){
  secondary_app_details_two += `
    <div style="width: 50%;float: left;text-align: center;border-right: 1px solid #eeeeee;">
      <img
        src="https://costcalculator.redbytes.in/sec_app_${template_version == 'red' ? 'rb' : template_version == 'purple' ? 'pb' : 'cx'}.png"
        width="25px"
        height="27px"
        style="margin-top: 10px"
      />
      <div style="font-size: 14px; font-weight: 700">${secondary_app_name}</div>
      <div style="font-size: 12px; color: ${ template_version == 'red' ? '#F20101' : template_version == 'purple' ? '#491C61' : '#2a50eb'}; font-weight: 600">
        ${Math.round(appefforts_two)} hrs
      </div>
    </div>
  `
}

if(estm_result[0]?.other_app_names != '' && estm_result[0].secondaryapp_efforts != 0){
  secondary_app_complete_details += `<div style="margin-top: 20px">
  <div style="float: left; width: 20%">
    <img
      src=${template_version == 'red' ? 'http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f022be81-8d7d-40b6-92e7-598b62c8fa53/30x30.png' : template_version == 'purple' ? 'https://costcalculator.redbytes.in/Circle.png' : 'http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a5707e4f-8f14-440d-8c4f-a3d46fed3d6d/38x38.png'}
      style="padding-left: 25px; margin-top: 25px"
    />
  </div>
  <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
    <div style="padding: 25px" width="100%">
      <div style="width: 10%; float: left">
        <img
          src=${template_version == 'red' ? 'http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/1c44ecea-e05b-4202-a5fa-ec676afc4694/12x20.png' : template_version == 'purple' ? 'https://costcalculator.redbytes.in/mobile.png' : 'http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/cc2d22c5-6ae1-4a6c-af0b-6b5f5e0525ab/12x20.png'}
          style="margin-top: 10px"
        />
      </div>
      <div style="width: 90%; float: right">
        <div style="font-size: 20px; font-weight: bold">
          Secondary Apps
        </div>
        <div style="font-size: 12px; color: ${ template_version == 'red' ? '#F20101' : template_version == 'purple' ? '#491C61' : '#2a50eb'}; font-weight: bold">
          ${Math.round(estm_result[0].secondaryapp_efforts)} hrs
        </div>
      </div>
    </div>
  </div>
  </div>
  
  <div style="margin-top: 30px">
  <img
    src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
    style="padding: 0 0 0 60%"
  />
  </div>
  
  <div style="margin-top: 20px">
  <div style="float: left; width: 20%">
    <span style="padding-left: 25px; margin-top: 25px"></span>
  </div>
  <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
    <div style="padding: 25px" width="100%">
      ${secondary_app_details_one}
      ${secondary_app_details_two}
    </div>
  </div>
  </div>`
}


  let reduction_details = ``;
  let reduction_details_version_red = ``;
  let reduction_details_version_purple = ``;
  // send email with sendgrid
  // const SENDGRID_APY_KEY = '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';
  const SENDGRID_APY_KEY = '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';
  sgMail.setApiKey(SENDGRID_APY_KEY);

  let user_id_ts = Math.random() * (9999 - 1111) + 350;
  const file_name = "user_pdf-"+Math.round(user_id_ts);
  let customer_mail_template = `<!DOCTYPE html>
  <html lang="en">
  <head>
  </head>
  <body
    style="font-family: Overpass, sans-serif;box-sizing: border-box;padding: 0;margin:0;">
    <div class="main-container" style="padding:50px;padding-top:0px">
      <div>
        <div>
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/816a3a60-be94-4a51-8144-b5330ff87d59/200x70.png" alt="Creating Email Magic" width="150"/>
          <img src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/1f877a2d-6669-4c59-bcf7-7814894a2474/284x91.png" alt="Creating Email Magic" style="float: right" height="75" />
        </div>
      </div>

      <div class="pg-title" style="text-align: right">
        <h2>MOBILE APP COST CALCULATOR</h2>
      </div>

      <div style="border-top: 2px solid #2a50eb"></div>
      <div style="text-align: center">
        <img src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/d2884548-259c-434c-9406-fbdfdc6e6155/2293x1368.png" style="width: 550px; margin-top: 20px" alt="image" />
      </div>

      <div style="margin-top: 20px; border-bottom: 1px solid #eeeeee">
        <h2 class="heading" style="text-align: center; color: #2a50eb">
          Greetings!
        </h2>
        <p style="font-size: 14px;line-height: 25px;padding: 1px 20px;font-weight: 600;">
          Dear ${estm_result[0].user_name},
        </p>
        <p style="font-size: 14px;line-height: 25px;padding: 1px 20px;font-weight: 500;">
          Thank you for trusting us to help you find a solution. Please find
          below a high-level Effort and Cost estimation based on your
          preferences.
        </p>
      </div>

      <div style="border-bottom: 2px solid #eeeeee">
        <h2 style="text-align: center;margin: 20px 0;font-size: 20px;font-weight: 600;">
          Application Specifications
        </h2>
      </div>

      <div style="border-bottom: 1px solid #eeeeee">
        <table
          width="100%"
          cell-spacing="0"
          cell-padding="0"
          border-collapse:
          collapse;
        >
          <thead>
            <tr style="background-color: #2a50eb; color: #ffffff">
              <th
                style="text-transform: uppercase; padding: 10px; color: #ffffff"
              >
                App Specifications
              </th>
              <th
                style="text-transform: uppercase; padding: 10px; color: #ffffff"
              >
                User Preferences
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; padding: 10px">
                Application Category
              </td>
              <td style="text-align: center; padding: 10px">${estm_result[0].domain_id}</td>
            </tr>
            <tr>
              <td
                style="text-align: center; background: #f7f7f7; padding: 10px">
                Platforms Selected
              </td>
              <td
                style="text-align: center; background: #f7f7f7; padding: 10px"
              >${dis_platform.replace(/,\s*$/, "")}</td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Admin Panel</td>
              <td style="text-align: center; padding: 10px">Yes</td>
            </tr>
            <tr>
              <td
                style="text-align: center; background: #f7f7f7; padding: 10px"
              >
                Web Application
              </td>
              <td
                style="text-align: center; background: #f7f7f7; padding: 10px"
              >
              ${web_application}
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Secondary App</td>
              <td style="text-align: center; padding: 10px">
              ${primary_app_name} ${secondary_app_name}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="border-bottom: 2px solid #eeeeee">
        <h2
          style="
            text-align: center;
            margin: 20px;
            font-size: 20px;
            font-weight: 600;
          "
        >
          App Version Specifications
        </h2>
      </div>
      <div style="border-bottom: 1px solid #eeeeee">
        <table
          width="100%"
          cell-spacing="0"
          cell-padding="0"
          border-collapse:
          collapse;
        >
          <thead>
            <tr style="background-color: #2a50eb; color: #ffffff">
              <th
                style="text-transform: uppercase; padding: 10px; color: #ffffff"
              >
                App Version Specifications
              </th>
              <th
                style="text-transform: uppercase; padding: 10px; color: #ffffff"
              >
                Android
              </th>
              <th
                style="text-transform: uppercase; padding: 10px; color: #ffffff"
              >
                iOS
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; padding: 10px">Latest Version</td>
              <td style="text-align: center; padding: 10px">11.0</td>
              <td style="text-align: center; padding: 10px">14</td>
            </tr>
            <tr>
              <td
                style="text-align: center; background: #f7f7f7; padding: 10px"
              >
                Backward Compatibility
              </td>
              <td
                style="text-align: center; background: #f7f7f7; padding: 10px"
              >
                6.0
              </td>
              <td
                style="text-align: center; background: #f7f7f7; padding: 10px"
              >
                12
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Screen Sizes</td>
              <td style="text-align: center; padding: 10px">5.0 -> 6.9</td>
              <td style="text-align: center; padding: 10px">4.7 -> 6.5</td>
            </tr>
            <tr>
              <td
                style="text-align: center; background: #f7f7f7; padding: 10px"
              >
                Minimum SDK Version
              </td>
              <td
                style="text-align: center; background: #f7f7f7; padding: 10px"
              >
                Marshmallow - Version-6
                <br />API Level -23
              </td>
              <td
                style="text-align: center; background: #f7f7f7; padding: 10px"
              >
                -
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">
                Maximum SDK Version
              </td>
              <td style="text-align: center; padding: 10px">
                Android 11 - Version-11 <br />
                API Level -30
              </td>
              <td style="text-align: center; padding: 10px">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        style="
          background-color: #f7f7f7;
          padding: 30px;
          margin-top: 20px;
          text-align: center;
        "
      >
        <h4
          style="
            font-weight: bold;
            margin-top: 0;
            font-size: 24px;
            margin-bottom: 5px;
          "
        >
          Grand Cost
        </h4>
        <h2
          style="
            margin-top: 0;
            margin-bottom: 5px;
            color: #2a50eb;
            font-size: 30px;
            letter-spacing: 3px;
            font-weight: 400;
          "
        >
        ${Math.round(estm_result[0].total_cost)} ${estm_result[0].currency_code}
        </h2>
        <p style="margin-top: 0; margin-bottom: 30px">
          If this is a bit unexpected, we are keen to help you to reduce this
          cost, Please answer few more questions.
        </p>

        <div style="text-align: center">
          <div
            style="
              height: 56px;
              line-height: 56px;
              border: 2px solid #2a50eb;
              background: #f7f7f7;
            "
          >
            <span
              class="cx-ttext"
              style="font-weight: 600; display: block; font-size: 20px"
              >TIMELINE ${Math.round(timeline_val)} Months (approx.)</span
            >
          </div>
        </div>
      </div>

      <div
        style="
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          padding-top: 20px;
          padding-bottom: 20px;
        "
      >
        Cost Breakups
      </div>

      <div
        style="
          background-color: #f7f7f7;
          box-sizing: border-box;
          box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);
          height: 100px;
        "
      >
        <div style="padding: 25px">
          <div style="width: 10%; float: left">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/999a295f-d448-4fff-a663-4183d66d9958/32x32.png"
            />
          </div>
          <div style="width: 90%; float: right">
            <div style="font-size: 20px; font-weight: bold">${estm_result[0].domain_id}</div>
            <div style="font-size: 12px; color: #2a50eb; font-weight: bold">
            ${Math.round(estm_result[0].total_efforts)} Hours
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a5707e4f-8f14-440d-8c4f-a3d46fed3d6d/38x38.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div
          style="
            background-color: #f7f7f7;
            box-sizing: border-box;
            box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);
            height: 100px;
            width: 80%;
            float: right;
          "
        >
          <div style="padding: 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/b837d2d2-b761-4302-bc30-46c2a6b0f9a8/24x24.png"
                style="margin-top: 10px"
              />
            </div>

            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">
                Screen Design
              </div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: bold">
              ${uiscreenhrs} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a5707e4f-8f14-440d-8c4f-a3d46fed3d6d/38x38.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div
          style="
            background-color: #f7f7f7;
            box-sizing: border-box;
            box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);
            height: 100px;
            width: 80%;
            float: right;
          "
        >
          <div style="padding: 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/13113dc1-aaef-4979-ac80-7bebaf534efd/17x24.png"
                style="margin-top: 10px"
              />
            </div>
            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">Front End</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: bold">
                ${Math.round(estm_result[0].frontend_efforts)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div
          style="
            background-color: #f7f7f7;
            box-sizing: border-box;
            box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);
            height: 100px;
            width: 80%;
          "
        >
          <div style="padding: 25px" width="100%">
            <div
              style="
                width: 33%;
                float: left;
                text-align: center;
                border-right: 1px solid #eeeeee;
              "
            >
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/ca0b98f9-567b-4dde-b165-84a6d8c06db9/21x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Android</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${Math.round(estm_result[0].android_efforts)} hrs
              </div>
            </div>
            <div style="width: 33%; float: right; text-align: center">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/cd7361c4-29eb-438f-871d-ebad79f028d5/24x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Web App</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${Math.round(estm_result[0].web_efforts)} hrs
              </div>
            </div>
            <div
              style="
                width: 33%;
                float: right;
                text-align: center;
                border-right: 1px solid #eeeeee;
              "
            >
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/ac3c063a-b737-4f8a-ba7a-768c98a6fac6/20x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">iOS</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${Math.round(estm_result[0].ios_efforts)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%"></div>
        <div
          style="
            background-color: #f7f7f7;
            box-sizing: border-box;
            box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);
            width: 80%;
          "
        >
          <div style="padding: 25px" width="100%">
            <div width="100%">
              <div style="text-align: right; padding: 0 10px">
                <h5
                  style="
                    background: #595856;
                    color: #ffffff;
                    text-align: center;
                    padding-top: 10px;
                    padding-bottom: 10px;
                  "
                >
                  Feature List
                </h5>
              </div>
              <div style="text-align: left; padding: 0 10px">
                <ul style="list-style-type:disc;">${modular_list_full}</ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a5707e4f-8f14-440d-8c4f-a3d46fed3d6d/38x38.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div
          style="
            background-color: #f7f7f7;
            box-sizing: border-box;
            box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);
            height: 100px;
            width: 80%;
          "
        >
          <div style="padding: 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/7567fc10-9141-4c9c-a7d8-964c80048dc3/21x19.png"
                style="margin-top: 10px"
              />
            </div>
            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">Backend</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: bold">
                ${estm_result[0].backend_efforts} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="
            background-color: #f7f7f7;
            box-sizing: border-box;
            box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);
            height: 100px;
            width: 80%;">
          <div style=" display: flex" width="100%">
            <div style="
                width: 33%;
                text-align: center;
                border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/64c904e8-8dd9-4dcf-9bb3-9d1fac9d48b7/27x26.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Web Services</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${estm_result[0].webservices_efforts} hrs
              </div>
            </div>
            <div style="width: 33%; text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a5b8b471-37ee-4507-928f-be3daf8eef0b/19x25.png "
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Database</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${estm_result[0].backend_efforts} hrs
              </div>
            </div>
            <div style="
                width: 33%;
                text-align: center;
                border-right: 1px solid #eeeeee;">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a0f2ed45-38e1-46bc-b320-48a3a6f1b544/20x24.png"
                  style="margin-top: 10px"
                />
              <div style="font-size: 14px; font-weight: 700">Admin Panel</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${estm_result[0].adm_panel_efforts}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="
            background-color: #f7f7f7;
            box-sizing: border-box;
            box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);
            width: 80%;
            padding: 0 60px;">
          <div width="50%" style="float: left">
            <div style="text-align: left; padding: 0 10px">
              <h5 style="
                  background: #595856;
                  color: #ffffff;
                  text-align: center;
                  padding: 10px 30px;">
                Basic Features
              </h5>
            </div>
            <div style="text-align: left; padding: 0 10px">
            <ul>
              ${adminpanel_list_basic}
            </ul>
            </div>
          </div>

          <div width="50%" style="float: right">
            <div style="text-align: left; padding: 0 10px">
              <h5 style="
                  background: #595856;
                  color: #ffffff;
                  text-align: center;
                  padding: 10px 30px;">
                Advance Features
              </h5>
            </div>
            <div style="text-align: left; padding: 0 10px">
            <ul>
              ${adminpanel_list_advance}
            </ul>
            </div>
          </div>
        </div>
      </div>

      ${secondary_app_complete_details}

      <!-- <div style="margin-top: 20px">
        <div style="float: left; width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a5707e4f-8f14-440d-8c4f-a3d46fed3d6d/38x38.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="
            background-color: #f7f7f7;
            box-sizing: border-box;
            box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);
            height: 100px;
            width: 80%;
            float: right;">
          <div style="padding: 25px" width="100%">
            <div style="width: 10%; float: left">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/cc2d22c5-6ae1-4a6c-af0b-6b5f5e0525ab/12x20.png"
                style="margin-top: 10px"
              />
            </div>
            <div style="width: 90%; float: right">
              <div style="font-size: 20px; font-weight: bold">
                Secondary Apps
              </div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: bold">
                ${Math.round(estm_result[0].secondaryapp_efforts)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px">
        <div style="float: left; width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="
            background-color: #f7f7f7;
            box-sizing: border-box;
            box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);
            height: 100px;
            width: 80%;
            float: right;">
          <div style="padding: 25px" width="100%">
            <div style="
                width: 50%;
                float: left;
                text-align: center;
                border-right: 1px solid #eeeeee;">
              <img
                src="https://costcalculator.redbytes.in/sec_app_${template_version == 'red' ? 'rb' : template_version == 'purple' ? 'pb' : 'cx'}.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">${primary_app_name}</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${Math.round(appefforts_one)} hrs
              </div>
            </div>

            <div style="width: 45%; float: right; text-align: center">
              <img
                src="https://costcalculator.redbytes.in/sec_app_${template_version == 'red' ? 'rb' : template_version == 'purple' ? 'pb' : 'cx'}.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">${secondary_app_name}</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${Math.round(appefforts_two)} hrs
              </div>
            </div>
          </div>
        </div>
      </div> -->

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="
          background-color: #f7f7f7;
          padding: 30px;
          margin-top: 20px;
          text-align: center;">
        <h4
          style="
            font-weight: 600;
            margin-top: 0;
            font-size: 24px;
            margin-bottom: 5px;">
          Grand Total
        </h4>
        <h2
          style="
            margin-top: 0;
            margin-bottom: 5px;
            font-size: 30px;
            letter-spacing: 3px;
            font-weight: 400;
            color: #2a50eb;
          "
        >
          ${Math.round(estm_result[0].total_cost)} ${estm_result[0].currency_code}
        </h2>
        <p style="margin-top: 0; margin-bottom: 30px">
          If this is a bit unexpected, we are keen to help you to reduce this
          cost, Please answer a few more questions.
        </p>
      </div>`;

  reduction_details = `<div>
       <h2
         style="
           text-align: center;
           margin-top: 20px;
           font-size: 20px;
           font-weight: bold;
         "
       >
         REDUCED COST DETAILS
       </h2>
     </div>

     <div style="text-align: center">
       <table style="width: 100%">
         <thead style="background-color: #2a50eb">
           <tr>
             <th style="color: #ffffff; padding: 10px 20px; font-size: 18px">
               Cost Reduction
             </th>
             <th style="color: #ffffff; padding: 10px 20px; font-size: 18px">
               User Input
             </th>
             <th style="color: #ffffff; padding: 10px 20px; font-size: 18px">
               Before
             </th>
             <th style="color: #ffffff; padding: 10px 20px; font-size: 18px">
               After
             </th>
           </tr>
         </thead>
         <tbody>
           <tr>
             <td style="padding: 10px 20px; font-size: 18px">
               Screen Design reduced ?
             </td>
             <td style="padding: 10px 20px; font-size: 18px">${screenDesignStatus.toUpperCase()}</td>
             <td style="padding: 10px 20px; font-size: 18px">${before_document}</td>
             <td style="padding: 10px 20px; font-size: 18px">${after_document}</td>
           </tr>
           <tr>
             <td style="padding: 10px 20px; font-size: 18px">
               Platform reduced
             </td>
             <td style="padding: 10px 20px; font-size: 18px">${selectedPlatforms}</td>
             <td style="padding: 10px 20px; font-size: 18px">${before_cloud_service}</td>
             <td style="padding: 10px 20px; font-size: 18px">${after_cloud_service}</td>
           </tr>
           <tr>
             <td style="padding: 10px 20px; font-size: 18px">
               Technology reduced
             </td>
             <td style="padding: 10px 20px; font-size: 18px">${selectedTechnology.toUpperCase()}</td>
             <td style="padding: 10px 20px; font-size: 18px">${before_Tech_service}</td>
             <td style="padding: 10px 20px; font-size: 18px">${after_Tech_service}</td>
           </tr>
           <tr>
             <td style="padding: 10px 20px; font-size: 18px">
               Secondary App reduced
             </td>
             <td style="padding: 10px 20px; font-size: 18px">${other_app_name}</td>
             <td style="padding: 10px 20px; font-size: 18px">${before_screen_deisgn}</td>
             <td style="padding: 10px 20px; font-size: 18px">${(sec_app_length == 0)?before_screen_deisgn:after_screen_deisgn }</td>
           </tr>
           <tr>
             <td style="padding: 10px 20px; font-size: 18px">
               Timeline selected
             </td>
             <td style="padding: 10px 20px; font-size: 18px">${selectedTimeline}</td>
             <td style="padding: 10px 20px; font-size: 18px">${(sec_app_length == 0)?before_screen_deisgn:before_timeline_service}</td>
             <td style="padding: 10px 20px; font-size: 18px">${after_timeline_service}</td>
           </tr>
         </tbody>
       </table>
     </div>

     <div width="100%">
       <div
         style="
           float: right;
           clear: left;
           margin: 30px 0;
           background: #ececec;
           border-bottom-left-radius: 50px;
           border-top-left-radius: 50px;
           padding: 5px;
           border: 1px solid #2a50eb;
           border-right: none;
           text-align: right;
         "
       >
         <h2
           class="title"
           style="
             margin: 10px 0px;
             font-weight: 600;
             font-size: 22px;
             color: #000000;
             padding: 0px 16px;
           "
         >
           YOUR SAVED COST : &nbsp;
           <b style="color: #000000; font-weight: 600">${savedAmount} ${estm_result[0].currency_code}</b>
         </h2>
       </div>
     </div>

     <div>
       <h2
         style="
           text-align: center;
           margin-top: 30px;
           margin-bottom: 10px;
           font-size: 20px;
           font-weight: bold;
           clear: both;
         "
       >
         REDUCED COST IS
       </h2>
     </div>

     <div style="text-align: center">
       <h2
         style="font-weight: 500; font-size: 50px; color: #2d9c00; margin: 0"
       >
         ${after_timeline_service} ${estm_result[0].currency_code}
       </h2>
     </div>`;
  
  // ================================================================================
  let customer_mail_template_version_red = `<!DOCTYPE html>
  <html lang="en"><head></head>
  <body style="font-family: Overpass, sans-serif;box-sizing: border-box;padding: 0;margin:0;">
    <div class="main-container" style="padding:50px;padding-top:0px">
      <div>
        <div>
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/3acd8747-2022-48cf-99d8-fa02223bcfe8/707x216.png" alt="Creating Email Magic" width="150"/>
          <img src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/1fc7dc6b-b558-40fa-b995-2447bd6cb449/282x90.png" alt="Creating Email Magic" style="float: right" height="75" />
        </div>
      </div>

      <div class="pg-title" >
        <h2 style="text-align: right">MOBILE APP COST CALCULATOR</h2>
      </div>

      <div style="border-top: 2px solid #F20101"></div>
      <div style="text-align: center">
        <img src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f37d2286-0b6f-4f40-bf55-5602c0ce53cc/852x508.png" style="width: 550px; margin-top: 20px" alt="image" />
      </div>

      <div style="margin-top: 20px; border-bottom: 1px solid #eeeeee">
        <h2 class="heading" style="text-align: center; color: #F20101">
          Greetings!
        </h2>
        <p style="font-size: 14px;line-height: 25px;padding: 1px 20px;font-weight: 600;">
          Dear ${estm_result[0].user_name},
        </p>
        <p style="font-size: 14px;line-height: 25px;padding: 1px 20px;font-weight: 500;">
          Thank you for trusting us to help you find a solution. Please find
          below a high-level Effort and Cost estimation based on your
          preferences.
        </p>
      </div>

      <div style="border-bottom: 2px solid #eeeeee">
        <h2 style="text-align: center;margin: 20px 0;font-size: 20px;font-weight: 600;">
          Application Specifications
        </h2>
      </div>

      <div style="border-bottom: 1px solid #eeeeee">
        <table width="100%"
          cell-spacing="0"
          cell-padding="0"
          border-collapse:collapse;>
          <thead>
            <tr style="background-color: #F20101; color: #ffffff">
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                App Specifications
              </th>
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                User Preferences
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; padding: 10px">Application Category</td>
              <td style="text-align: center; padding: 10px">${estm_result[0].domain_id}</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">Platforms Selected</td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">${dis_platform.replace(/,\s*$/, "")}</td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Admin Panel</td>
              <td style="text-align: center; padding: 10px">Yes</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">Web Application</td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
              ${web_application}
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Secondary App</td>
              <td style="text-align: center; padding: 10px">
              ${primary_app_name} ${secondary_app_name}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="border-bottom: 2px solid #eeeeee">
        <h2 style="text-align: center;margin: 20px;font-size: 20px;font-weight: 600;">App Version Specifications</h2>
      </div>
      <div style="border-bottom: 1px solid #eeeeee">
        <table
          width="100%"
          cell-spacing="0"
          cell-padding="0"
          border-collapse:collapse;>
          <thead>
            <tr style="background-color: #F20101; color: #ffffff">
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">App Version Specifications</th>
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">Android</th>
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">iOS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; padding: 10px">Latest Version</td>
              <td style="text-align: center; padding: 10px">11.0</td>
              <td style="text-align: center; padding: 10px">14</td>
            </tr>
            <tr>
              <td bstyle="text-align: center; background: #f7f7f7; padding: 10px">Backward Compatibility</td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">6.0</td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">12</td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Screen Sizes</td>
              <td style="text-align: center; padding: 10px">5.0 -> 6.9</td>
              <td style="text-align: center; padding: 10px">4.7 -> 6.5</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Minimum SDK Version
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Marshmallow - Version-6
                <br />API Level -23
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                -
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">
                Maximum SDK Version
              </td>
              <td style="text-align: center; padding: 10px">
                Android 11 - Version-11 <br />
                API Level -30
              </td>
              <td style="text-align: center; padding: 10px">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="background-color: #f7f7f7;padding: 30px;margin-top: 20px;text-align: center;">
        <h4 style="font-weight: bold;margin-top: 0;font-size: 24px;margin-bottom: 5px;">
          Grand Cost
        </h4>
        <h2 style="margin-top: 0;margin-bottom: 5px;color: #F20101;font-size: 30px;letter-spacing: 3px;font-weight: 400;">
        ${Math.round(estm_result[0].total_cost)} ${estm_result[0].currency_code}
        </h2>
        <p style="margin-top: 0; margin-bottom: 30px">
          If this is a bit unexpected, we are keen to help you to reduce this
          cost, Please answer few more questions.
        </p>

        <div style="text-align: center">
          <div style="height: 56px;line-height: 56px;border: 2px solid #F20101;background: #f7f7f7;">
            <span class="cx-ttext"style="font-weight: 600; display: block; font-size: 20px">TIMELINE ${Math.round(timeline_val)} Months (approx.)</span>
          </div>
        </div>
      </div>

      <div style="text-align: center;font-size: 20px;font-weight: bold;padding-top: 20px;padding-bottom: 20px;">
        Cost Breakups
      </div>

      <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;">
        <div style="padding: 25px">
          <div style="width: 10%; float: left">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/92bfbb0a-831d-455a-856f-7de0bb1d36d8/32x32.png"
            />
          </div>
          <div style="width: 90%; float: right">
            <div style="font-size: 20px; font-weight: bold">${estm_result[0].domain_id}</div>
            <div style="font-size: 12px; color: #F20101; font-weight: bold">
            ${Math.round(estm_result[0].total_efforts)} Hours
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f022be81-8d7d-40b6-92e7-598b62c8fa53/30x30.png"
            style="padding-left: 25px; margin-top: 25px"/>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
          <div style="padding: 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/14c989c2-5bb2-40a3-bc23-d621edb508db/24x24.png"
                style="margin-top: 10px"
              />
            </div>

            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">
                Screen Design
              </div>
              <div style="font-size: 12px; color: #F20101; font-weight: bold">
              ${uiscreenhrs} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f022be81-8d7d-40b6-92e7-598b62c8fa53/30x30.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
          <div style="padding: 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/29a67025-65e8-4a71-a313-8b104cdee317/26x36.png"
                style="margin-top: 10px"
              />
            </div>
            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">Front End</div>
              <div style="font-size: 12px; color: #F20101; font-weight: bold">
                ${Math.round(estm_result[0].frontend_efforts)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;">
          <div style="padding: 25px" width="100%">
            <div style="width: 33%;float: left;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/6f46607e-2437-4a71-b255-521db2babb06/21x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Android</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${Math.round(estm_result[0].android_efforts)} hrs
              </div>
            </div>
            <div style="width: 33%; float: right; text-align: center">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/d649217b-4b59-497f-ad56-b4d353cec59f/24x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Web App</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${Math.round(estm_result[0].web_efforts)} hrs
              </div>
            </div>
            <div style="width: 33%;float: right;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/b19a6fd8-fc93-4dd7-b300-2a8242390cc8/20x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">iOS</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${Math.round(estm_result[0].ios_efforts)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%"></div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 80%;">
          <div style="padding: 25px" width="100%">
            <div width="100%">
              <div style="text-align: right; padding: 0 10px">
                <h5 style="background: #595856;color: #ffffff;text-align: center;padding-top: 10px;padding-bottom: 10px;">
                  Feature List
                </h5>
              </div>
              <div style="text-align: left; padding: 0 10px">
                <ul style="list-style-type:disc;">${modular_list_full}</ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f022be81-8d7d-40b6-92e7-598b62c8fa53/30x30.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;">
          <div style="padding: 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/67452889-614e-475b-8f9e-0d80f6253686/21x19.png"
                style="margin-top: 10px" />
            </div>
            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">Backend</div>
              <div style="font-size: 12px; color: #F20101; font-weight: bold">
                ${estm_result[0].backend_efforts} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;">
          <div style=" display: flex" width="100%">
            <div style="width: 33%;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/3c9d11c9-530d-45a2-8f0b-82154359a03a/24x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Web Services</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${estm_result[0].webservices_efforts} hrs
              </div>
            </div>
            <div style="width: 33%; text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/e8c42d7f-f637-4a6d-afd7-ed1368c89993/19x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Database</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${estm_result[0].db_efforts} hrs
              </div>
            </div>
            <div style="width: 33%;text-align: center;border-right: 1px solid #eeeeee;">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/b1c7b097-c357-4726-993e-9579962b90b3/20x24.png"
                  style="margin-top: 10px"
                />
              <div style="font-size: 14px; font-weight: 700">Admin Panel</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${estm_result[0].adm_panel_efforts}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 80%;padding: 0 60px;">
          <div width="50%" style="float: left">
            <div style="text-align: left; padding: 0 10px">
              <h5 style="background: #595856;color: #ffffff;text-align: center;padding: 10px 30px;">
                Basic Features
              </h5>
            </div>
            <div style="text-align: left; padding: 0 10px">
            <ul>
              ${adminpanel_list_basic}
            </ul>
            </div>
          </div>

          <div width="50%" style="float: right">
            <div style="text-align: left; padding: 0 10px">
              <h5 style="background: #595856;color: #ffffff;text-align: center;padding: 10px 30px;">
                Advance Features
              </h5>
            </div>
            <div style="text-align: left; padding: 0 10px">
            <ul>
              ${adminpanel_list_advance}
            </ul>
            </div>
          </div>
        </div>
      </div>

      ${secondary_app_complete_details}

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="background-color: #f7f7f7;padding: 30px;margin-top: 20px;text-align: center;">
        <h4 style="font-weight: 600;margin-top: 0;font-size: 24px;margin-bottom: 5px;">
          Grand Total
        </h4>
        <h2 style="margin-top: 0;margin-bottom: 5px;font-size: 30px;letter-spacing: 3px;font-weight: 400;color: #F20101;">
          ${Math.round(estm_result[0].total_cost)} ${estm_result[0].currency_code}
        </h2>
        <p style="margin-top: 0; margin-bottom: 30px">
          If this is a bit unexpected, we are keen to help you to reduce this
          cost, Please answer a few more questions.
        </p>
      </div>`;

  let customer_mail_template_version_purple = `<!DOCTYPE html>
  <html lang="en">
    <head>
    </head>
    <body
      style="font-family: Overpass, sans-serif;box-sizing: border-box;padding: 0;margin:0;">
      <div class="main-container" style="padding:50px;padding-top:0px">
        <div>
          <div>
            <img
              src="https://costcalculator.redbytes.in/probytes_logo.png" alt="Creating Email Magic" width="150"/>
            <img src="https://costcalculator.redbytes.in/header_band.png" alt="Creating Email Magic" style="float: right" height="75" />
          </div>
        </div>
  
        <div class="pg-title" style="text-align: right">
          <h2>MOBILE APP COST CALCULATOR</h2>
        </div>
  
        <div style="border-top: 2px solid #491C61"></div>
        <div style="text-align: center">
          <img src="https://costcalculator.redbytes.in/center_icon.png" style="width: 550px; margin-top: 20px" alt="image" />
        </div>
  
        <div style="margin-top: 20px; border-bottom: 1px solid #eeeeee">
          <h2 class="heading" style="text-align: center; color: #491C61">
            Greetings!
          </h2>
          <p style="font-size: 14px;line-height: 25px;padding: 1px 20px;font-weight: 600;">
            Dear ${estm_result[0].user_name},
          </p>
          <p style="font-size: 14px;line-height: 25px;padding: 1px 20px;font-weight: 500;">
            Thank you for trusting us to help you find a solution. Please find
            below a high-level Effort and Cost estimation based on your
            preferences.
          </p>
        </div>
  
        <div style="border-bottom: 2px solid #eeeeee">
          <h2 style="text-align: center;margin: 20px 0;font-size: 20px;font-weight: 600;">
            Application Specifications
          </h2>
        </div>
  
        <div style="border-bottom: 1px solid #eeeeee">
          <table
            width="100%"
            cell-spacing="0"
            cell-padding="0"
            border-collapse:collapse;>
            <thead>
              <tr style="background-color: #491C61; color: #ffffff">
                <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                  App Specifications
                </th>
                <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                  User Preferences
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align: center; padding: 10px">
                  Application Category
                </td>
                <td style="text-align: center; padding: 10px">${estm_result[0].step1_domain_data}</td>
              </tr>
              <tr>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">
                  Platforms Selected
                </td>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">${dis_platform}</td>
              </tr>
              <tr>
                <td style="text-align: center; padding: 10px">Admin Panel</td>
                <td style="text-align: center; padding: 10px">Yes</td>
              </tr>
              <tr>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">
                  Web Application
                </td>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">
                ${web_application}
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding: 10px">Secondary App</td>
                <td style="text-align: center; padding: 10px">
                "secd_app_names"
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <div style="border-bottom: 2px solid #eeeeee">
          <h2 style="text-align: center;margin: 20px;font-size: 20px;font-weight: 600;">
            App Version Specifications
          </h2>
        </div>
        <div style="border-bottom: 1px solid #eeeeee">
          <table
            width="100%"
            cell-spacing="0"
            cell-padding="0"
            border-collapse:collapse;>
            <thead>
              <tr style="background-color: #491C61; color: #ffffff">
                <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                  App Version Specifications
                </th>
                <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                  Android
                </th>
                <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                  iOS
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align: center; padding: 10px">Latest Version</td>
                <td style="text-align: center; padding: 10px">11.0</td>
                <td style="text-align: center; padding: 10px">14</td>
              </tr>
              <tr>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">
                  Backward Compatibility
                </td>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">
                  6.0
                </td>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">
                  12
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding: 10px">Screen Sizes</td>
                <td style="text-align: center; padding: 10px">5.0 -> 6.9</td>
                <td style="text-align: center; padding: 10px">4.7 -> 6.5</td>
              </tr>
              <tr>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">
                  Minimum SDK Version
                </td>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">
                  Marshmallow - Version-6
                  <br />API Level -23
                </td>
                <td style="text-align: center; background: #f7f7f7; padding: 10px">
                  -
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding: 10px">
                  Maximum SDK Version
                </td>
                <td style="text-align: center; padding: 10px">
                  Android 11 - Version-11 <br />
                  API Level -30
                </td>
                <td style="text-align: center; padding: 10px">-</td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <div style="background-color: #f7f7f7;padding: 30px;margin-top: 20px;text-align: center;">
          <h4 style="font-weight: bold;margin-top: 0;font-size: 24px;margin-bottom: 5px;">
            Grand Cost
          </h4>
          <h2 style="margin-top: 0;margin-bottom: 5px;color: #491C61;font-size: 30px;letter-spacing: 3px;font-weight: 400;">
            ${Math.round(estm_result[0].total_cost)} ${estm_result[0].currency_code}
          </h2>
          <p style="margin-top: 0; margin-bottom: 30px">
            If this is a bit unexpected, we are keen to help you to reduce this cost, Please answer few more questions.
          </p>
          <div style="text-align: center">
            <div style="height: 56px;line-height: 56px;border: 2px solid #491C61;background: #f7f7f7;">
              <span class="cx-ttext" style="font-weight: 600; display: block; font-size: 20px">TIMELINE ${Math.round(timeline_val)} Months (approx.)</span>
            </div>
          </div>
        </div>
  
        <div style="text-align: center;font-size: 20px;font-weight: bold;padding-top: 20px;padding-bottom: 20px;">
          Cost Breakups
        </div>
  
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 60px;">
          <div style="padding: 12px 25px;">
            <div style="width: 10%; float: left">
              <img
                src="https://costcalculator.redbytes.in/shopping_cart.png"
              />
            </div>
            <div style="width: 90%; float: right">
              <div style="font-size: 20px; font-weight: bold">${estm_result[0].domain_id}</div>
              <div style="font-size: 12px; color: #491C61; font-weight: bold">
              ${Math.round(estm_result[0].total_efforts)} Hours
              </div>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 15px; display: flex">
          <div style="width: 10%">
            <img
              src="https://costcalculator.redbytes.in/Circle.png"
              style="padding-left: 25px; margin-top: 25px"
            />
          </div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 60px;width: 90%;float: right;">
            <div style="padding: 12px 25px; display: flex" width="100%">
              <div style="width: 10%">
                <img
                  src="https://costcalculator.redbytes.in/screen_design.png"
                  style="margin-top: 10px"
                />
              </div>
  
              <div style="width: 90%">
                <div style="font-size: 20px; font-weight: bold">
                  Screen Design
                </div>
                <div style="font-size: 12px; color: #491C61; font-weight: bold">
                ${uiscreenhrs} hrs
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 15px; display: flex">
          <div style="width: 10%">
            <img
              src="https://costcalculator.redbytes.in/Circle.png"
              style="padding-left: 25px; margin-top: 25px"
            />
          </div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 60px;width: 90%;float: right;">
            <div style="padding: 12px 25px; display: flex" width="100%">
              <div style="width: 10%">
                <img
                  src="https://costcalculator.redbytes.in/frontend.png"
                  style="margin-top: 10px"
                />
              </div>
              <div style="width: 90%">
                <div style="font-size: 20px; font-weight: bold">Front End</div>
                <div style="font-size: 12px; color: #491C61; font-weight: bold">
                  ${Math.round(estm_result[0].frontend_efforts)} hrs
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div>
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
            style="padding: 0 0 0 60%"
          />
        </div>
  
        <div style="margin-top: 0; display: flex">
          <div style="width: 10%">
            <span style="padding-left: 25px; margin-top: 25px"></span>
          </div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: auto;width: 90%;">
            <div style="padding: 12px 25px" width="100%">
              <div style="width: 33%;float: left;text-align: center;border-right: 1px solid #eeeeee;">
                <img
                  src="https://costcalculator.redbytes.in/android.png"
                  style="margin-top: 10px"
                />
                <div style="font-size: 14px; font-weight: 700">Android</div>
                <div style="font-size: 12px; color: #491C61; font-weight: 600">
                  ${Math.round(estm_result[0].android_efforts)} hrs
                </div>
              </div>
              <div style="width: 33%; float: right; text-align: center">
                <img
                  src="https://costcalculator.redbytes.in/website.png"
                  style="margin-top: 10px"
                />
                <div style="font-size: 14px; font-weight: 700">Web App</div>
                <div style="font-size: 12px; color: #491C61; font-weight: 600">
                  ${Math.round(estm_result[0].web_efforts)} hrs
                </div>
              </div>
              <div style="width: 33%;float: right;text-align: center;border-right: 1px solid #eeeeee;">
                <img
                  src="https://costcalculator.redbytes.in/apple.png"
                  style="margin-top: 10px"
                />
                <div style="font-size: 14px; font-weight: 700">iOS</div>
                <div style="font-size: 12px; color: #491C61; font-weight: 600">
                  ${Math.round(estm_result[0].ios_efforts)} hrs
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 0px">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
            style="padding: 0 0 0 60%"
          />
        </div>
  
        <div style="margin-top: 0px; display: flex">
          <div style="width: 10%"></div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 90%;">
            <div style="padding: 12px 25px" width="100%">
              <div width="100%">
                <div style="text-align: right; padding: 0 10px">
                  <h5 style="background: #595856;color: #ffffff;text-align: center;padding-top: 10px;padding-bottom: 10px;">
                    Feature List
                  </h5>
                </div>
                <div style="text-align: left; padding: 0 10px">
                  <ul style="list-style-type:disc;">${modular_list_full}</ul>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 15px; display: flex">
          <div style="width: 10%">
            <img
              src="https://costcalculator.redbytes.in/Circle.png"
              style="padding-left: 25px; margin-top: 25px"
            />
          </div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 60px;width: 90%;">
            <div style="padding: 12px 25px; display: flex" width="100%">
              <div style="width: 10%">
                <img
                  src="https://costcalculator.redbytes.in/web_services.png"
                  style="margin-top: 10px"
                />
              </div>
              <div style="width: 90%">
                <div style="font-size: 20px; font-weight: bold">Backend</div>
                <div style="font-size: 12px; color: #491C61; font-weight: bold">
                  ${estm_result[0].backend_efforts} hrs
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 0px">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
            style="padding: 0 0 0 60%"
          />
        </div>
  
        <div style="margin-top: 0px; display: flex">
          <div style="width: 10%">
            <span style="padding-left: 25px; margin-top: 25px"></span>
          </div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: auto;width: 90%;">
            <div style=" display: flex" width="100%">
              <div style="width: 33%;text-align: center;border-right: 1px solid #eeeeee;">
                <img
                  src="https://costcalculator.redbytes.in/web_service_circle.png"
                  style="margin-top: 10px"
                />
                <div style="font-size: 14px; font-weight: 700">Web Services</div>
                <div style="font-size: 12px; color: #491C61; font-weight: 600">
                  ${estm_result[0].webservices_efforts} hrs
                </div>
              </div>
              <div style="width: 33%; text-align: center;border-right: 1px solid #eeeeee;">
                <img
                  src="https://costcalculator.redbytes.in/database_icon.png"
                  style="margin-top: 10px"
                />
                <div style="font-size: 14px; font-weight: 700">Database</div>
                <div style="font-size: 12px; color: #491C61; font-weight: 600">
                  ${estm_result[0].db_efforts} hrs
                </div>
              </div>
              <div style="width: 33%;text-align: center;border-right: 1px solid #eeeeee;">
                  <img
                    src="https://costcalculator.redbytes.in/administrator.png"
                    style="margin-top: 10px"
                  />
                <div style="font-size: 14px; font-weight: 700">Admin Panel</div>
                <div style="font-size: 12px; color: #491C61; font-weight: 600">
                  ${estm_result[0].adm_panel_efforts}
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 0px">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
            style="padding: 0 0 0 60%"
          />
        </div>
  
        <div style="margin-top: 0px; display: flex">
          <div style="width: 10%">
            <span style="padding-left: 25px; margin-top: 25px"></span>
          </div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 90%;padding: 0;">
            <div  style="float: left;width: 50%">
              <div style="text-align: left; padding: 0 10px">
                <h5 style="background: #595856;color: #ffffff;text-align: center;padding: 10px 30px;">
                  Basic Features
                </h5>
              </div>
              <div style="text-align: left; padding: 0 10px">
                <ul>
                  ${adminpanel_list_basic}
                </ul>
              </div>
            </div>
  
            <div  style="float: left;width: 50%">
              <div style="text-align: left; padding: 0 10px">
                <h5 style="background: #595856;color: #ffffff;text-align: center;padding: 10px 30px;">
                  Advance Features
                </h5>
              </div>
              <div style="text-align: left; padding: 0 10px">
                <ul>
                  ${adminpanel_list_advance}
                </ul>
              </div>
            </div>
          </div>
        </div>

        ${secondary_app_complete_details}
  
        <!-- <div style="margin-top: 0px">
          <div style="float: left; width: 10%">
            <img
              src="https://costcalculator.redbytes.in/Circle.png"
              style="padding-left: 25px; margin-top: 25px"
            />
          </div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 60px;width: 90%;float: right;">
            <div style="padding: 12px 25px" width="100%">
              <div style="width: 10%; float: left">
                <img
                  src="https://costcalculator.redbytes.in/mobile.png"
                  style="margin-top: 10px"
                />
              </div>
              <div style="width: 90%; float: right">
                <div style="font-size: 20px; font-weight: bold">
                  Secondary Apps
                </div>
                <div style="font-size: 12px; color: #491C61; font-weight: bold">
                  ${Math.round(estm_result[0].secondaryapp_efforts)} hrs
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 0px">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
            style="padding: 0 0 0 60%"
          />
        </div>
  
        <div style="margin-top: 0px">
          <div style="float: left; width: 10%">
            <span style="padding-left: 25px; margin-top: 25px"></span>
          </div>
          <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: auto;width: 90%;float: left;">
            <div style="padding: 12px 25px" width="100%">output</div>
          </div>
        </div> -->
  
        <!-- <div style="margin-top: 0px">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
            style="padding: 0 0 0 60%"
          />
        </div>
  
        secondary_app_modular_list -->
  
        <div style="background-color: #f7f7f7;padding: 30px;margin-top: 20px;text-align: center;">
          <h4 style="font-weight: 600;margin-top: 0;font-size: 24px;margin-bottom: 5px;">
            Grand Total
          </h4>
          <h2 style="margin-top: 0;margin-bottom: 5px;font-size: 30px;letter-spacing: 3px;font-weight: 400;color: #491C61;">
            ${Math.round(estm_result[0].total_cost)} ${estm_result[0].currency_code}
          </h2>
          <p style="margin-top: 0; margin-bottom: 30px">
            If this is a bit unexpected, we are keen to help you to reduce this
            cost, Please answer a few more questions.
          </p>
        </div>
  
        <div style="text-align: center">
          <p style="margin: 30px 0">Try With Our Cost Calculator App</p>
          <span>
            <a href="https://play.google.com/store/apps/details?id=com.redbytes.projectcostcalculator&hl=en&gl=US" target="_blank">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/653dbb03-fb0f-4e75-a95a-c149526d95bb/5436x1604.png"
                style="height: 60px; width: 200px"
              />
            </a>
          </span>
          <span>
            <a href="https://apps.apple.com/gb/app/cost-calculator/id1482880672" target="_blank">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/4f466f9c-90d6-4259-87df-ddf9a8bb2872/1990x590.png"
                style="height: 60px; width: 200px"
              />
            </a>
          </span>
  
          <p style="text-align: center; margin: 30px 0">
            We hope this estimate is to your satisfaction and offers a
            comprehensive picture. For any further queries, we would be happy to
            respond at
          </p>
        </div>
  
        <div style="text-align: center; margin-top: 20px;">
          <table style="width: 100%">
            <tr>
              <td style="" valign="bottom">
                <a href="https://probytes.net" target="_blank">
                <img
                  src="https://costcalculator.redbytes.in/www_logo.png"
                  style="margin-bottom: -9px;"/>
                <span style="margin-left: 5px;">www.probytes.net</span>
                </a>
              </td>
  
              <td>
                <img
                src="https://costcalculator.redbytes.in/whatsapp_logo.png"
                style="margin-bottom: -9px;"/>
                <span style="margin-left: 5px;">+91 8113 869 000</span>
              </td>
  
              <td>
                <img
                src="https://costcalculator.redbytes.in/calling.png"
                style="margin-bottom: -9px;"/>
              <span style="margin-left: 5px;">+1 9295521900</span>
              </td>
            </tr>
          </table>
        </div>
  
        <div>
          <h2 style="text-align: center;margin-top: 50px;margin-bottom: 10px;font-size: 20px;font-weight: bold;">
            More About App Development
          </h2>
        </div>
  
        <div style="box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 100%;">
          <div width="100%" style="display: flex; justify-content: center;">
            <div style="width: 40%;text-align: center;border: 1px solid #eeeeee;padding: 20px 0;">
                <a href="https://www.redbytes.in/how-much-does-it-cost-to-develop-an-app/" target="_blank">
              <img
                src="https://costcalculator.redbytes.in/big_doller.png"
                style="margin-top: 10px; width: 26px"/>
              <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
                How Much
              </div>
            </a>
            </div>
  
            <div style="width: 40%;text-align: center;border: 1px solid #eeeeee;padding: 20px 0;">
                <a href="https://www.redbytes.in/how-to-create-an-app-like-udemy/" target="_blank">
              <img
                src="https://costcalculator.redbytes.in/setting.png"
                style="margin-top: 10px; width: 48px"
              />
              <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
                How To
              </div>
            </a>
            </div>
          </div>
        </div>
  
        <div style="margin-top: 50px">
          <h2 style="color: #491C61; margin-top: 30px; margin-bottom: 0">
            DISCLAIMER
          </h2>
          <p style="margin-top: 10px">
            We have formulated this model based on Intelligent and Predictive
            analytics and is honed by years of industry experience. We can assure
            you that, based on your present preference, this estimate will be
            about 70-80 % accurate
          </p>
          <span style="color: #491C61"
            >Note: This email is generated from App Cost Calculator page -
            Redbytes
          </span>
        </div>
  
        <div style="margin-top: 20px" width="100%">
          <div style="float: left; width: 50%">
            <img
              src="https://costcalculator.redbytes.in/bottom_header.png"
              alt="Creating Email Magic"
              height="75"
            />
          </div>
          <div style="float: right; width: 50%; text-align: right">
            <div width="100%">
              <div class="cx-atext" style="text-align: right;margin-right: 5px;float: left;width: 90%;">
                <p style="margin: 0">125/2, Sainiketan Colony, kalas Road,</p>
                <p style="margin: 0">Visharant Wadi,</p>
                <p style="margin: 0">Pune, Maharashtra 411015.</p>
              </div>
              
              <div width="10%" style="float: right">
                <img
                  src="https://costcalculator.redbytes.in/location_icon.png"
                  style="padding-top: 15px"/>
              </div>
  
            </div>
          </div>
        </div>
  
        <div style="border-bottom: 2px solid #eeeeee; margin-top: 40px; clear: both;"></div>
      </div>
    </body>
  </html>`;

  reduction_details_version_red = `<div>
      <h2 style="text-align: center;margin-top: 20px;font-size: 20px;font-weight: bold;">REDUCED COST DETAILS</h2>
    </div>

    <div style="text-align: center">
      <table style="width: 100%">
        <thead style="background-color: #F20101">
          <tr>
            <th style="color: #ffffff; padding: 10px 20px; font-size: 18px">Cost Reduction</th>
            <th style="color: #ffffff; padding: 10px 20px; font-size: 18px">User Input</th>
            <th style="color: #ffffff; padding: 10px 20px; font-size: 18px">Before</th>
            <th style="color: #ffffff; padding: 10px 20px; font-size: 18px">After</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px 20px; font-size: 18px">Screen Design reduced ?</td>
            <td style="padding: 10px 20px; font-size: 18px">${screenDesignStatus.toUpperCase()}</td>
            <td style="padding: 10px 20px; font-size: 18px">${before_document}</td>
            <td style="padding: 10px 20px; font-size: 18px">${after_document}</td>
          </tr>
          <tr>
            <td style="padding: 10px 20px; font-size: 18px">Platform reduced</td>
            <td style="padding: 10px 20px; font-size: 18px">${selectedPlatforms}</td>
            <td style="padding: 10px 20px; font-size: 18px">${before_cloud_service}</td>
            <td style="padding: 10px 20px; font-size: 18px">${after_cloud_service}</td>
          </tr>
          <tr>
            <td style="padding: 10px 20px; font-size: 18px">Technology reduced</td>
            <td style="padding: 10px 20px; font-size: 18px">${selectedTechnology.toUpperCase()}</td>
            <td style="padding: 10px 20px; font-size: 18px">${before_Tech_service}</td>
            <td style="padding: 10px 20px; font-size: 18px">${after_Tech_service}</td>
          </tr>
          <tr>
            <td style="padding: 10px 20px; font-size: 18px">Secondary App reduced</td>
            <td style="padding: 10px 20px; font-size: 18px">${other_app_name}</td>
            <td style="padding: 10px 20px; font-size: 18px">${before_screen_deisgn}</td>
            <td style="padding: 10px 20px; font-size: 18px">${(sec_app_length == 0)?before_screen_deisgn:after_screen_deisgn }</td>
          </tr>
          <tr>
            <td style="padding: 10px 20px; font-size: 18px">Timeline selected</td>
            <td style="padding: 10px 20px; font-size: 18px">${selectedTimeline}</td>
            <td style="padding: 10px 20px; font-size: 18px">${(sec_app_length == 0)?before_screen_deisgn:before_timeline_service}</td>
            <td style="padding: 10px 20px; font-size: 18px">${after_timeline_service}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div width="100%">
      <div style="float: right;clear: left;margin: 30px 0;background: #ececec;border-bottom-left-radius: 50px;border-top-left-radius: 50px;padding: 5px;border: 1px solid #F20101;border-right: none;text-align: right;">
        <h2 class="title" style="margin: 10px 0px;font-weight: 600;font-size: 22px;color: #000000;padding: 0px 16px;">
          YOUR SAVED COST : &nbsp;
          <b style="color: #000000; font-weight: 600">${savedAmount} ${estm_result[0].currency_code}</b>
        </h2>
      </div>
    </div>

    <div>
      <h2 style="text-align: center;margin-top: 30px;margin-bottom: 10px;font-size: 20px;font-weight: bold;clear: both;">REDUCED COST IS
      </h2>
    </div>

    <div style="text-align: center">
      <h2 style="font-weight: 500; font-size: 50px; color: #2d9c00; margin: 0">
        ${after_timeline_service} ${estm_result[0].currency_code}
      </h2>
    </div>`;
  reduction_details_version_purple = `<div>
  <h2 style="text-align: center;margin-top: 20px;font-size: 20px;font-weight: bold;">REDUCED COST DETAILS</h2>
</div>

<div style="text-align: center">
  <table style="width: 100%">
    <thead style="background-color: #491C61">
      <tr>
        <th style="color: #ffffff; padding: 10px 20px; font-size: 18px">Cost Reduction</th>
        <th style="color: #ffffff; padding: 10px 20px; font-size: 18px">User Input</th>
        <th style="color: #ffffff; padding: 10px 20px; font-size: 18px">Before</th>
        <th style="color: #ffffff; padding: 10px 20px; font-size: 18px">After</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 10px 20px; font-size: 18px">Screen Design reduced ?</td>
        <td style="padding: 10px 20px; font-size: 18px">${screenDesignStatus.toUpperCase()}</td>
        <td style="padding: 10px 20px; font-size: 18px">${before_document}</td>
        <td style="padding: 10px 20px; font-size: 18px">${after_document}</td>
      </tr>
      <tr>
        <td style="padding: 10px 20px; font-size: 18px">Platform reduced</td>
        <td style="padding: 10px 20px; font-size: 18px">${selectedPlatforms}</td>
        <td style="padding: 10px 20px; font-size: 18px">${before_cloud_service}</td>
        <td style="padding: 10px 20px; font-size: 18px">${after_cloud_service}</td>
      </tr>
      <tr>
        <td style="padding: 10px 20px; font-size: 18px">Technology reduced</td>
        <td style="padding: 10px 20px; font-size: 18px">${selectedTechnology.toUpperCase()}</td>
        <td style="padding: 10px 20px; font-size: 18px">${before_Tech_service}</td>
        <td style="padding: 10px 20px; font-size: 18px">${after_Tech_service}</td>
      </tr>
      <tr>
        <td style="padding: 10px 20px; font-size: 18px">Secondary App reduced</td>
        <td style="padding: 10px 20px; font-size: 18px">${other_app_name}</td>
        <td style="padding: 10px 20px; font-size: 18px">${before_screen_deisgn}</td>
        <td style="padding: 10px 20px; font-size: 18px">${(sec_app_length == 0)?before_screen_deisgn:after_screen_deisgn }</td>
      </tr>
      <tr>
        <td style="padding: 10px 20px; font-size: 18px">Timeline selected</td>
        <td style="padding: 10px 20px; font-size: 18px">${selectedTimeline}</td>
        <td style="padding: 10px 20px; font-size: 18px">${(sec_app_length == 0)?before_screen_deisgn:before_timeline_service}</td>
        <td style="padding: 10px 20px; font-size: 18px">${after_timeline_service}</td>
      </tr>
    </tbody>
  </table>
</div>

<div width="100%">
  <div style="float: right;clear: left;margin: 30px 0;background: #ececec;border-bottom-left-radius: 50px;border-top-left-radius: 50px;padding: 5px;border: 1px solid #491C61;border-right: none;text-align: right;">
    <h2 class="title" style="margin: 10px 0px;font-weight: 600;font-size: 22px;color: #000000;padding: 0px 16px;">
      YOUR SAVED COST : &nbsp;
      <b style="color: #000000; font-weight: 600">${savedAmount} ${estm_result[0].currency_code}</b>
    </h2>
  </div>
</div>

<div>
  <h2 style="text-align: center;margin-top: 30px;margin-bottom: 10px;font-size: 20px;font-weight: bold;clear: both;">REDUCED COST IS
  </h2>
</div>

<div style="text-align: center">
  <h2 style="font-weight: 500; font-size: 50px; color: #2d9c00; margin: 0">
    ${after_timeline_service} ${estm_result[0].currency_code}
  </h2>
    </div>`;



      
  if(estm_result[0].rd_screen_design == 'No' || estm_result[0].rd_screen_design == 'Yes' ){
    customer_mail_template += reduction_details;
    customer_mail_template_version_red += reduction_details_version_red;
    customer_mail_template_version_purple += reduction_details_version_purple;
  }

  customer_mail_template += `<div style="text-align: center">
        <p style="margin: 30px 0">Try With Our Cost Calculator App</p>
        <span>
          <a
            href="https://play.google.com/store/apps/details?id=com.redbytes.projectcostcalculator&hl=en&gl=US"
          >
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/653dbb03-fb0f-4e75-a95a-c149526d95bb/5436x1604.png"
              style="height: 60px; width: 200px"
            />
          </a>
        </span>
        <span>
          <a href="https://apps.apple.com/gb/app/cost-calculator/id1482880672">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/4f466f9c-90d6-4259-87df-ddf9a8bb2872/1990x590.png"
              style="height: 60px; width: 200px"
            />
          </a>
        </span>

        <p style="text-align: center; margin: 30px 0">
          We hope this estimate is to your satisfaction and offers a
          comprehensive picture. For any further queries, we would be happy to
          respond at
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <table style="width: 100%">
          <tr>
            <td style="" valign="bottom">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/9cfec0a3-e987-4c18-8204-dd7566c48281/30x31.png"
                style="margin-bottom: -9px;"
              />
              <span style="margin-left: 5px;">www.cloudxperte.com</span>
            </td>

            <td>
              <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/35e3a74f-0faa-4ecb-a54c-7ac71aec0e62/30x30.png"
              style="margin-bottom: -9px;"
            />
              <span style="margin-left: 5px;">+91 81138 62000</span>
            </td>

            <td>
              <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/23566361-0ce0-48ee-a871-a62c95d794e7/31x31.png"
              style="margin-bottom: -9px;"
            />
            <span style="margin-left: 5px;">+1 92955 21900</span>
            </td>
          </tr>
        </table>
      </div>

      <div>
        <h2
          style="
            text-align: center;
            margin-top: 50px;
            margin-bottom: 10px;
            font-size: 20px;
            font-weight: bold;
          "
        >
          More About App Development
        </h2>
      </div>

      <div
        style="
          box-sizing: border-box;
          box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);
          width: 100%;
        "
      >
        <div width="100%" style="display: flex; justify-content: center;">
          <div
            style="
              width: 40%;
              text-align: center;
              border: 1px solid #eeeeee;
              padding: 20px 0;
            "
          >
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f3ae7fcf-8653-4ba1-baea-56bb18feacd6/27x50.png"
              style="margin-top: 10px; width: 26px"
            />
            <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
              How Much
            </div>
          </div>

          <div
            style="
              width: 40%;
              text-align: center;
              border: 1px solid #eeeeee;
              padding: 20px 0;
            "
          >
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/533183b4-bf90-460e-8be0-5a8bc47a5a89/243x242.png"
              style="margin-top: 10px; width: 48px"
            />
            <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
              How To
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 50px">
        <h2 style="color: #2a50eb; margin-top: 30px; margin-bottom: 0">
          DISCLAIMER
        </h2>
        <p style="margin-top: 10px">
          We have formulated this model based on Intelligent and Predictive
          analytics and is honed by years of industry experience. We can assure
          you that, based on your present preference, this estimate will be
          about 70-80 % accurate
        </p>
        <span style="color: #2a50eb"
          >Note: This email is generated from App Cost Calculator page -
          CloudXperte
        </span>
      </div>

      <div style="margin-top: 20px" width="100%">
        <div style="float: left; width: 50%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/7a693d2f-6166-40db-b0a2-d95f745c5a52/283x91.png"
            alt="Creating Email Magic"
            height="75"
          />
        </div>
        <div style="float: right; width: 50%; text-align: right">
          <div width="100%">
            <div
              class="cx-atext"
              style="
                text-align: right;
                margin-right: 5px;
                float: left;
                width: 90%;
              "
            >
              <p style="margin: 0">15, Software Technology Park of India,</p>
              <p style="margin: 0">Chikalthana MIDC,</p>
              <p style="margin: 0">Aurangabad, Maharashtra. 431210</p>
            </div>

            
            <div width="10%" style="float: right">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/109037b9-7454-4f2a-a812-e131afc7e697/31x31.png"
                style="padding-top: 15px"
              />
            </div>


          </div>
        </div>
      </div>

      <div style="border-bottom: 2px solid #eeeeee; margin-top: 40px; clear: both;"></div>
    </div>
  </body>
  </html>`;
  
  customer_mail_template_version_red += `<div style="text-align: center">
    <p style="margin: 30px 0">Try With Our Cost Calculator App</p>
    <span>
      <a href="https://play.google.com/store/apps/details?id=com.redbytes.projectcostcalculator&hl=en&gl=US">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/653dbb03-fb0f-4e75-a95a-c149526d95bb/5436x1604.png"
          style="height: 60px; width: 200px"
        />
      </a>
    </span>
    <span>
      <a href="https://apps.apple.com/gb/app/cost-calculator/id1482880672">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/4f466f9c-90d6-4259-87df-ddf9a8bb2872/1990x590.png"
          style="height: 60px; width: 200px"
        />
      </a>
    </span>

    <p style="text-align: center; margin: 30px 0">
      We hope this estimate is to your satisfaction and offers a
      comprehensive picture. For any further queries, we would be happy to
      respond at
    </p>
  </div>

  <div style="text-align: center; margin-top: 20px;">
    <table style="width: 100%">
      <tr>
        <td style="" valign="bottom">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/ed580ade-ae61-4f9b-95d7-5fc7f9f9e486/30x30.png"
            style="margin-bottom: -9px;" />
            <span style="margin-left: 5px;">www.redbytes.in</span>
        </td>

        <td>
          <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/35e3a74f-0faa-4ecb-a54c-7ac71aec0e62/30x30.png"
          style="margin-bottom: -9px;" />
          <span style="margin-left: 5px;">+91 8113 869 000</span>
        </td>

        <td>
          <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/c4d830a2-cc39-4dc8-8679-05a8527a939a/30x30.png"
          style="margin-bottom: -9px;" />
          <span style="margin-left: 5px;">+1 9295521900</span>
        </td>
      </tr>
    </table>
  </div>

  <div>
    <h2 style="text-align: center;margin-top: 50px;margin-bottom: 10px;font-size: 20px;font-weight: bold;">More About App Development
    </h2>
  </div>

  <div style="box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 100%;">
    <div width="100%" style="display: flex; justify-content: center;">
      <div style="width: 40%;text-align: center;border: 1px solid #eeeeee;padding: 20px 0;">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/95ff66f0-7260-4127-ba67-63d065f78e02/100x192.png"
          style="margin-top: 10px; width: 26px"/>
        <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
          How Much
        </div>
      </div>

      <div style="width: 40%;text-align: center;border: 1px solid #eeeeee;padding: 20px 0;">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/ecff8b2b-32b4-4d09-9700-78865298bd88/243x243.png"
          style="margin-top: 10px; width: 48px"/>
        <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
          How To
        </div>
      </div>
    </div>
  </div>

  <div style="margin-top: 50px">
    <h2 style="color: #F20101; margin-top: 30px; margin-bottom: 0">DISCLAIMER</h2>
    <p style="margin-top: 10px">We have formulated this model based on Intelligent and Predictive analytics and is honed by years of industry experience. We can assure you that, based on your present preference, this estimate will be about 70-80 % accurate</p>
    <span style="color: #F20101">Note: This email is generated from App Cost Calculator page - Redbytes</span>
  </div>

  <div style="margin-top: 20px" width="100%">
    <div style="float: left; width: 50%">
      <img
        src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/9315d5c0-eac8-44fa-8bc2-ee4388763831/282x90.png"
        alt="Creating Email Magic"
        height="75"
      />
    </div>

    <div style="float: right; width: 50%; text-align: right">
      <div width="100%">
        <div class="cx-atext" style="text-align: right;margin-right: 5px;float: left;width: 90%;">
          <p style="margin: 0">125/2, Sainiketan Colony, kalas Road, </p>
          <p style="margin: 0">Visharant Wadi,</p>
          <p style="margin: 0">Pune, Maharashtra 411015.</p>
        </div>
        <div width="10%" style="float: right">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/74801c97-6e6e-440f-b0c2-83bb8f58695f/30x30.png"
            style="padding-top: 15px"
          />
        </div>
      </div>
    </div>
  </div>

  <div style="border-bottom: 2px solid #eeeeee; margin-top: 40px; clear: both;"></div>
  </div>
  </body>
</html>`;
  customer_mail_template_version_purple += `<div style="text-align: center">
  <p style="margin: 30px 0">Try With Our Cost Calculator App</p>
  <span>
    <a
      href="https://play.google.com/store/apps/details?id=com.redbytes.projectcostcalculator&hl=en&gl=US"
    >
      <img
        src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/653dbb03-fb0f-4e75-a95a-c149526d95bb/5436x1604.png"
        style="height: 60px; width: 200px"
      />
    </a>
  </span>
  <span>
    <a href="https://apps.apple.com/gb/app/cost-calculator/id1482880672">
      <img
        src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/4f466f9c-90d6-4259-87df-ddf9a8bb2872/1990x590.png"
        style="height: 60px; width: 200px"
      />
    </a>
  </span>

  <p style="text-align: center; margin: 30px 0">
    We hope this estimate is to your satisfaction and offers a
    comprehensive picture. For any further queries, we would be happy to
    respond at
  </p>
</div>

<div style="text-align: center; margin-top: 20px;">
  <table style="width: 100%">
    <tr>
      <td style="" valign="bottom">
        <img
          src="https://costcalculator.redbytes.in/www_logo.svg"
          style="margin-bottom: -9px;"
        />
        <span style="margin-left: 5px;">www.cloudxperte.com</span>
      </td>

      <td>
        <img
        src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/35e3a74f-0faa-4ecb-a54c-7ac71aec0e62/30x30.png"
        style="margin-bottom: -9px;"
      />
        <span style="margin-left: 5px;">+91 81138 62000</span>
      </td>

      <td>
        <img
        src="https://costcalculator.redbytes.in/calling.svg"
        style="margin-bottom: -9px;"
      />
      <span style="margin-left: 5px;">+1 92955 21900</span>
      </td>
    </tr>
  </table>
</div>

<div>
  <h2
    style="
      text-align: center;
      margin-top: 50px;
      margin-bottom: 10px;
      font-size: 20px;
      font-weight: bold;
    "
  >
    More About App Development
  </h2>
</div>

<div
  style="
    box-sizing: border-box;
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);
    width: 100%;
  "
>
  <div width="100%" style="display: flex; justify-content: center;">
    <div
      style="
        width: 40%;
        text-align: center;
        border: 1px solid #eeeeee;
        padding: 20px 0;
      "
    >
      <img
        src="https://costcalculator.redbytes.in/big_doller.svg"
        style="margin-top: 10px; width: 26px"
      />
      <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
        How Much
      </div>
    </div>

    <div
      style="
        width: 40%;
        text-align: center;
        border: 1px solid #eeeeee;
        padding: 20px 0;
      "
    >
      <img
        src="https://costcalculator.redbytes.in/setting.svg"
        style="margin-top: 10px; width: 48px"
      />
      <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
        How To
      </div>
    </div>
  </div>
</div>

<div style="margin-top: 50px">
  <h2 style="color: #491C61; margin-top: 30px; margin-bottom: 0">
    DISCLAIMER
  </h2>
  <p style="margin-top: 10px">
    We have formulated this model based on Intelligent and Predictive
    analytics and is honed by years of industry experience. We can assure
    you that, based on your present preference, this estimate will be
    about 70-80 % accurate
  </p>
  <span style="color: #491C61"
    >Note: This email is generated from App Cost Calculator page -
    CloudXperte
  </span>
</div>

<div style="margin-top: 20px" width="100%">
  <div style="float: left; width: 50%">
    <img
      src="https://costcalculator.redbytes.in/bottom_header.png"
      alt="Creating Email Magic"
      height="75"
    />
  </div>
  <div style="float: right; width: 50%; text-align: right">
    <div width="100%">
      <div
        class="cx-atext"
        style="
          text-align: right;
          margin-right: 5px;
          float: left;
          width: 90%;
        "
      >
        <p style="margin: 0">15, Software Technology Park of India,</p>
        <p style="margin: 0">Chikalthana MIDC,</p>
        <p style="margin: 0">Aurangabad, Maharashtra. 431210</p>
      </div>

      
      <div width="10%" style="float: right">
        <img
          src="https://costcalculator.redbytes.in/location_icon.svg"
          style="padding-top: 15px"
        />
      </div>


    </div>
  </div>
</div>

<div style="border-bottom: 2px solid #eeeeee; margin-top: 40px; clear: both;"></div>
</div>
</body>
</html>`;

let pdf_file_path = '';
let to_email_id = '';
  
  if(template_version == "red"){
    pdf_file_path = await html_to_pdf(file_name, customer_mail_template_version_red, origin);
    // theme_template_id = 'd-abf2a645b7bc49a188b9d6897fe7d5de'
    // to_email_id = 'info@redbytes.in'
    theme_template_id = 'd-a83ad33e0ec4461497bd12e90e01d15b'
    to_email_id = mail_sender
  }else if(template_version == "purple"){
    pdf_file_path = await html_to_pdf(file_name, customer_mail_template_version_purple, origin);
    theme_template_id = 'd-84bcc786a86d4196bacc284747c9c37a';
    to_email_id = mail_sender
  } else{
    pdf_file_path = await html_to_pdf(file_name, customer_mail_template, origin);
    // theme_template_id = 'd-f971102512bf466f98a46bc21446dec1';
    // to_email_id = 'info@cloudxperte.com'
    theme_template_id = 'd-52b69a7d99fd473abae3a35030ebb109';
    to_email_id = mail_sender
  }

  
  // console.log('estm_result[0] = ',estm_result[0]);

// save lead in CRM
// array to string inputs
var functionalFeaturesBasic_arr = estm_result[0]?.ff_basic_list?.split(',');
var functionalFeaturesAdvance_arr = estm_result[0]?.ff_advance_list?.split(',');
const functional_features = functionalFeaturesBasic_arr.concat(functionalFeaturesAdvance_arr);  
var current_date = new Date().toJSON().slice(0,10);  
var today = new Date(); 
var current_time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var current_date_for_enq = current_date+' '+current_time;

var res_status = false;
var res_msg = '';
var options_inputs = {
  'method': 'POST',
  'url': 'https://admin.officecaller.com/api/leads/website_lead/',
  'headers': {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    "title": estm_result[0].user_name,
    "first_name": estm_result[0].user_name,
    "email": estm_result[0].email,
    "phone": estm_result[0].contact_no,
    "city": geo_data.city_name+', '+geo_data.country_name,
    "state": "",
    "country": geo_data.country_name, // get this dynamic
    "address_line": "",
    "latitude": "46412",
    "longitude": "12345",
    "contact_lead": "-",
    "app_category": estm_result[0].domain_id,
    "category_text": estm_result[0].domain_id,
    "app_platform": dis_platform,
    "cross_platfrom_status": "Yes",
    "which_cross_platform": "Native",
    "grand_cost": estm_result[0].cost_after_reduction+' '+estm_result[0].currency_code,
    "enq_date": current_date_for_enq,
    "favourite": "favourite here",
    "enq_through": "app OR web",  // need input
    // "enq_from": estm_result[0].rd_screen_design,
    // "enquiryfrom": estm_result[0].rd_screen_design,
    "enq_from": utm_source,
    "enquiryfrom": utm_source,
    "country_code": geo_data.flag_code,
    "choosen_approach": "Native",
    "choosen_devices": "Smartphones",
    "choosen_screen_count": 10,   // need inputs
    "choosen_login_methods": [],  // need inputs
    "choosen_features": functional_features,
    "choosen_language": "Multiple", 
    "choosen_admin": "Yes ",  
    "admin_efforts": estm_result[0].adm_panel_efforts,
    "choosen_webapp": (estm_result[0].is_web == 1)?"Yes":"No",
    "secondary_app": estm_result[0].other_app_names, 
    "screen_efforts": uiscreenhrs,
    "webservices": Math.round(estm_result[0].webservices_efforts),
    "webapp_efforts": Math.round(estm_result[0].web_efforts),
    "ios_efforts": Math.round(estm_result[0].ios_efforts),
    "android_efforts": Math.round(estm_result[0].android_efforts),
    "crossplatform_efforts": 0,
    "secondary_app_efforts": Math.round(estm_result[0].secondaryapp_efforts),
    "features_efforts": 0,    // need inputs
    "database_efforts": Math.round(estm_result[0].db_efforts),
    "grand_total_efforts": Math.round(estm_result[0].total_efforts),
    "approx_cost": Math.round(estm_result[0].total_efforts)+ ' '+conversion_data.currency_name,  
    "timeline_month": estm_result[0].rd_timeline_selected,    
    "user_comment": estm_result[0].message,
    "mail_date": current_date_for_enq,
    "apikey": "7dac0fcac909b349"
  })

};
request(options_inputs, function (error, response) {
  if (error){
    console.log("CRM Entry In Reduction error",error.message)
    throw new Error(error);
  } 
  res_msg = response.body;
  console.log("CRM Entry In Reduction response",response.body)
  res_status = true;
}); 

// console.log("estm_result[0].secondaryapp_efforts",estm_result[0].secondaryapp_efforts);
// console.log("first_app",primary_app_name);
// console.log("second_app",secondary_app_name);
// console.log("otherapps",otherapps);

  request(pdf_file_path, { encoding: null }, (err, res, body) => {
    if (err) { return err; }
    if (body) {
      const textBuffered = Buffer.from(body);

      const msg = {
        to: estm_result[0].email, // Change to your recipient
        // to: 'shubhangiramekar48@gmail.com',
        from: to_email_id, // Change to your verified sender
        subject: mail_subject,
        templateId: theme_template_id,   // set template ID
        dynamicTemplateData: {      // send required inputs/keys here
          rb_user_name: estm_result[0].user_name,
          mail_subject,
          catagory_text: estm_result[0].domain_id,
          selected_platform: dis_platform.replace(/,\s*$/, ""),  
          admin_panel: 'Yes',   // it's default
          web_application: (estm_result[0].is_web == 1) ? 'Yes' : 'No',   // based on web platform selection
          secondary_app: primary_app_name + ', ' + secondary_app_name,  // need to manage
          approx_cost:Math.round(estm_result[0].total_cost - 1583)+' '+estm_result[0].currency_code,   // change this later
          grand_cost: Math.round(estm_result[0].total_cost)+' '+estm_result[0].currency_code,  // round off the val
          timeline: Math.round(timeline_val) + ' Months',
          category_name: estm_result[0].domain_id,
          total_effort: Math.round(estm_result[0].total_efforts),
          screen_design_effort: uiscreenhrs,

          secondary_apps_display:secondary_app_details_one+=secondary_app_details_two,
          secondary_app_selected,

          front_end_effort: estm_result[0].frontend_efforts,
          android_effort: estm_result[0].android_efforts,
          ios_effort: estm_result[0].ios_efforts,
          web_app_effort: estm_result[0].web_efforts,
          database_effort: estm_result[0].db_efforts,

          module_list: modules_selected,

          backend_effort: estm_result[0].backend_efforts,
          web_services_effort: estm_result[0].webservices_efforts,
          admin_panel_effort: estm_result[0].adm_panel_efforts,
          adminpanel_basic_features: adminpanel_list_basic,
          adminpanel_advance_features: adminpanel_list_advance,

          secondary_app_effort: estm_result[0].secondaryapp_efforts,
          first_app: primary_app_name,  // set this as per domain name
          first_app_efforts: ((estm_result[0].secondaryapp_efforts) / 2),
          second_app: secondary_app_name, // set this as per domain name
          second_app_efforts: ((estm_result[0].secondaryapp_efforts) / 2),
          basic_feature_list_functional_features:functional_list_basic,
          advance_feature_list_functional_features:functional_list_advance,
          basic_feature_list_non_functional_features:nonfunctional_list_basic,
          advance_feature_list_non_functional_features:nonfunctional_list_advance,

          // reduction details
          is_reduced : is_reduced,
          user_inputs_1:screenDesignStatus.toUpperCase(),
          before_document:before_document,
          after_document:after_document,

          user_inputs_2: selectedPlatforms,
          before_cloud_service:before_cloud_service,
          after_cloud_service:after_cloud_service,

          user_inputs_3: selectedTechnology.toUpperCase(),
          before_Tech_service:before_Tech_service,
          after_Tech_service:after_Tech_service,

          user_inputs_4: other_app_name,
          before_screen_deisgn:before_screen_deisgn,
          after_screen_deisgn: (sec_app_length == 0)?before_screen_deisgn:after_screen_deisgn,

          user_inputs_5: selectedTimeline,
          before_timeline_service: (sec_app_length == 0)?before_screen_deisgn:before_timeline_service,
          after_timeline_service:after_timeline_service,

          saved_cost:savedAmount+' '+estm_result[0].currency_code,
          reduced_cost:after_timeline_service+' '+estm_result[0].currency_code
        },
        attachments: [
          {
            content: textBuffered.toString('base64'),
            filename: `${mail_attachment_name}.pdf`,
            type: 'application/pdf',
            disposition: 'attachment',
            content_id: 'mytext',
          },
        ],
      }

      sgMail
        .send(msg)
        .then((response) => {
          console.log("success");
        })
        .catch((error) => {
          console.log("error");
        })
    }
  });
  var result = {
    status: "success",    // ok
    message: "all ok with api v4",
  }
  return result;
}

const getAllCostEstimationCX_old = async (data, user_id, remote_ip, template_version, request_from,origin) => {
  console.log('function called EstimationCX');
  var step2_platform_data = data.step2_platform_data;
  var step3_feature_data = data.step3_feature_data;
  var step4_NonFunctional_data = data.step4_NonFunctional_data;
  var adminPanel_data = data.AdminPanel_data;
  var other_apps = data.OtherAppData;
  var step1_domain_data = data.step1_domain_data;
  var workingEfforts = data.workingEfforts;
  var selectedFeatures = data.selected_features;
  var selectedDomainSlug = data.selected_domain_slug;
  console.log(data);
  let modular_features_arr = await fetchGetMethod('modular_features?sel_domain=' + selectedDomainSlug + '');
  let module_arr_raw = modular_features_arr.modular_feature;
  let module_arr = Object.keys(module_arr_raw);

  var modular_list = {};
  // prepare modular list full
  let modular_list_full = "";
  // START LOOPING
  for (const module_title of module_arr) {
      var result = {};
      let feature_list_basic_arr = [];
      let feature_list_advance_arr = [];

      let list_basic = [];  
      let list_advance = [];

      let name_basic = [];
      let name_advance = [];

      // modular_list_full += "<li>"+module_title;
      // handle if basic list or advance list not available
        // modular_list_full += "<ul>";
          list_basic = modular_features_arr.modular_feature[module_title].basic_list;
          name_basic = list_basic.features;
          for (let j in name_basic) { // prepare basic list
              for (let k in selectedFeatures) { 
                  if(name_basic[j] == selectedFeatures[k].feature){
                      // console.log(name_basic[j]+' ---- '+features_list[k].feature);
                      feature_list_basic_arr.push(selectedFeatures[k].feature);
                      // modular_list_full += "<li>"+selectedFeatures[k].feature+"</li>";
                  }
              }
          }
          result['basic_list'] = feature_list_basic_arr

          list_advance = modular_features_arr.modular_feature[module_title].advance_list;
          name_advance = list_advance.features;
          for (let j in name_advance) { // prepare advance list
              for (let k in selectedFeatures) { 
                  if(name_advance[j] == selectedFeatures[k].feature){
                      feature_list_advance_arr.push(selectedFeatures[k].feature);
                      // modular_list_full += "<li>"+selectedFeatures[k].feature+"</li>";
                  }
              }
          }
          result['advance_list'] = feature_list_advance_arr
          // modular_list_full += "</ul>";
     
      // modular_list_full += "</li>";
      let combined_arr = feature_list_basic_arr.concat(feature_list_advance_arr)
          if(combined_arr.length != 0){
            modular_list[module_title] = combined_arr
          }
  }
  // END LOOPING
  let modl_list1 = Object.keys(modular_list);
  modl_list1.map(item =>{ 
  modular_list_full += '<li>'+item;
  modular_list_full += '<ul>';
    modular_list[item].map(feature =>{
      modular_list_full += '<li>'+feature+'</li>';
    })
    modular_list_full += '</ul>';
    modular_list_full += '</li>'
  })
  
  let allUnits;
  if(request_from == 'app'){
    allUnits = await getFeatureUnitsForApp();
  } else{
    allUnits = await getFeatureUnits();
  }
  var factorSumArray = [];
  allUnits.forEach(value => {
    var sumOfEachunit = findSumOfEachUnit(selectedFeatures, value, request_from);
    factorSumArray.push(sumOfEachunit);
  })
 
  var UPF = factorSumArray.reduce((a, b) => a + b, 0);
  console.log('UPF ----------> '+UPF);
  var complexityValues = await getdomainComplexityValue();
  const complexity_val = complexityValues.filter(function (e) { return e.d_slug == selectedDomainSlug }).map(ele => ele.value);
  var domanComplexityValue = 0;
  if (complexity_val.length != 0) {
    //  domanComplexityValue = complexity_val[0];
    domanComplexityValue = complexity_val[0];
  } else {
    domanComplexityValue = 0
  }
  console.log('domanComplexityValue ----------> '+domanComplexityValue);
  var CAF = parseFloat(0.65 + (0.01 * domanComplexityValue)).toFixed(2);  // Complexity Adjustment 
  console.log('CAF ----------> '+CAF);
  var functionalPoint = parseFloat(UPF * CAF).toFixed(2);
  var functionalFeature_cnt = parseFloat(functionalPoint * 8);//8 is total working hours in a day
  var workingEfforts = parseFloat(functionalPoint * 8);//8 is total working hours in a day
  console.log('workingEfforts ----------> '+workingEfforts);
  var uiscreenhrs = 150;  // fixed
  var source_and_medium_url = data.screenDesignStatus; // data.screenDesignStatus;    // getting utm source and medium value
  // note: to avoid mobile app crashing, re-used screenDesignStatus key to get this value. change it in next mobile version update
  var app_primary = 0; var app_secondary = 0;
  var total_apps = 1;   // 1 for main app compulsory (other app selection is not needed)

  // get count for other apps selected 
  if (other_apps.includes("primary_app") == true) {
    app_primary = 1;
  }
  if (other_apps.includes("Secondary_app") == true) {
    app_secondary = 1;
  }

  var non_functional_fts_hrs = 100;   // 100 for non_functional_fts_hrs is fixed
  var percent_of = 60;    // for web platform
  var other_app_percent_of = 40;  // for other app
  var fn_nfn_hrs_total = parseFloat(functionalFeature_cnt + non_functional_fts_hrs);
  let total_hrs_for_single = workingEfforts;
  var frontend_android_hrs = 0; var frontend_ios_hrs = 0; var frontend_web_hrs = 0;
  var frontend_total_hrs = 0;
  var selectedTechnology = (data.selectedTechnology == undefined) ? 'native' : data.selectedTechnology; //fixed
  var total_platform = 0;
  var total_app = 1;    // 1 for main app compulsory (other app selection is not needed)
  var dis_platform = '';
  var android = 0;
  var ios = 0;
  var web = 0;
  var frontendPlatForms = [];

  if (step2_platform_data.includes("Android")) {
    android = 1;
    frontend_android_hrs = total_hrs_for_single;
    frontend_total_hrs = frontend_android_hrs + frontend_ios_hrs + frontend_web_hrs;
    var pltFrm = {
      title: "Android",
      hours: frontend_android_hrs.toFixed(2)
    }
    frontendPlatForms.push(pltFrm);
  } else {
    var pltFrm = {
      title: "Android",
      hours: frontend_android_hrs
    }
    frontendPlatForms.push(pltFrm);
  }

  if (step2_platform_data.includes("iOS")) {
    ios = 1;
    frontend_ios_hrs = total_hrs_for_single;
    frontend_total_hrs = frontend_android_hrs + frontend_ios_hrs + frontend_web_hrs;
    var pltFrm = {
      title: "iOS",
      hours: frontend_ios_hrs.toFixed(2)
    }
    frontendPlatForms.push(pltFrm);
  } else {
    var pltFrm = {
      title: "iOS",
      hours: frontend_ios_hrs
    }
    frontendPlatForms.push(pltFrm);
  }

  if (step2_platform_data.includes("Web")) {
    web = 1;
    frontend_web_hrs = ((percent_of / 100) * total_hrs_for_single);
    frontend_total_hrs = frontend_android_hrs + frontend_ios_hrs + frontend_web_hrs;
    var pltFrm = {
      title: "Web",
      hours: frontend_web_hrs.toFixed(2)
    }
    frontendPlatForms.push(pltFrm);
  } else {
    var pltFrm = {
      title: "Web",
      hours: frontend_web_hrs
    }
    frontendPlatForms.push(pltFrm);
  }

  total_platform = parseInt(android) + parseInt(ios) + parseInt(web);
  dis_platform = step2_platform_data.join(', ');

  // collect list of features
  var functionalFeatures = step3_feature_data.basic_feature.join(', ');
  functionalFeatures += step3_feature_data.advance_feature.join(', ');
  var nonFunctionalFeatures = step4_NonFunctional_data.Basic_feature.join(', ');
  nonFunctionalFeatures += step4_NonFunctional_data.Advance_feature.join(', ');
  var adminPanelFeatures = adminPanel_data.Basic_feature.join(', ');
  adminPanelFeatures += adminPanel_data.Advance_feature.join(', ');

  // collect feature list seperately
  var functionalFeaturesBasic = step3_feature_data.basic_feature.join(', ');
  var functionalFeaturesAdvance = step3_feature_data.advance_feature.join(', ');
  var nonFunctionalFeaturesBasic = step4_NonFunctional_data.Basic_feature.join(', ');
  var nonFunctionalFeaturesAdvance = step4_NonFunctional_data.Advance_feature.join(', ');
  var adminPanelFeaturesBasic = adminPanel_data.Basic_feature.join(', ');
  var adminPanelFeaturesAdvance = adminPanel_data.Advance_feature.join(', ');

  const module_list_selected = [];
  Object.keys(modular_list).map(key => {
    let data_key = modular_list[key];
    // console.log(data_key.basic_list.length);
    
      module_list_selected.push(key)
    
  })
  // console.log('----------------------------------->');
  // console.log(module_list_selected);
  // set module list
  var module_list_full = "";
  let mod_list = data.step3_feature_modules
  module_list_selected.map(item => {
    module_list_full += "<li>"+item+"</li>"
  } )

  // set functional features - basic list
  var functional_list_basic = "";
  let fnb_list = step3_feature_data.basic_feature
  fnb_list.map(item => {
    functional_list_basic += "<li>"+item+"</li>"
  } )

  // set functional features - advance list
  var functional_list_advance = "";
  let fnad_list = step3_feature_data.advance_feature
  fnad_list.map(item => {
    functional_list_advance += '<li>'+item+'</li>'
  } )

  // set non-functional features - basic list
  var nonfunctional_list_basic = "";
  let nfnb_list = step4_NonFunctional_data.Basic_feature
  nfnb_list.map(item => {
    nonfunctional_list_basic += '<li>'+item+'</li>'
  } )

  // set non-functional features - advance list
  var nonfunctional_list_advance = "";
  let nfnad_list = step4_NonFunctional_data.Advance_feature
  nfnad_list.map(item => {
    nonfunctional_list_advance += '<li>'+item+'</li>'
  } )

  // set admin-panel features - basic list
  var adminpanel_list_basic = "";
  let admb_list = adminPanel_data.Basic_feature
  admb_list.map(item => {
    adminpanel_list_basic += '<li>'+item+'</li>'
  } )

  // set admin-panel features - advance list
  var adminpanel_list_advance = "";
  let admad_list = adminPanel_data.Advance_feature
  admad_list.map(item => {
    adminpanel_list_advance += '<li>'+item+'</li>'
  } )  

    

  var total_apps_sel = parseInt(total_app) + parseInt(app_primary) + parseInt(app_secondary);
  // fixed values
  var webServiceHrs = 20;
  var adminPanelHrs = 100;
  var databaseHrs = 10;

  // calculate hours for backend
  var webservices_hrs = webServiceHrs * total_platform;
  var database_hrs = databaseHrs * total_apps_sel;
  var admin_panel_hrs = adminPanelHrs * total_apps_sel;
  var backend_hrs = webservices_hrs + database_hrs + admin_panel_hrs;

  var backendPlatforms = [
    {
      title: "Web Service",
      hours: webservices_hrs.toFixed(2)
    },
    {
      title: "Admin Panal",
      hours: admin_panel_hrs.toFixed(2)
    },
    {
      title: "Database",
      hours: database_hrs.toFixed(2)
    }
  ];

  // calculate hours for secondary apps
  var other_app_only = 0;
  var primary_app_name = '';
  var secondary_app_name = '';
  var primary_app_efforts = 0;
  var secondary_app_efforts = 0;
  var other_app_icon1 = '';
  var other_app_icon2 = '';
  other_app_only = app_primary + app_secondary;
  var TotalHrs_fnf = functionalFeature_cnt + non_functional_fts_hrs;
  var total_hrs_for_single_app = (TotalHrs_fnf + (adminPanelHrs + webServiceHrs + databaseHrs) + uiscreenhrs);
  var other_app_total_hrs = ((other_app_percent_of / 100) * total_hrs_for_single);
  console.log('other app total hrs --- >'+other_app_total_hrs);
  var other_app_efrts = other_app_only * other_app_total_hrs;
  //set other app name based  on domain
  if (selectedDomainSlug == 'booking-apps-hotel-flight-taxi-etc') {
    primary_app_name = 'Vendor App';
    secondary_app_name = 'Delivery App';
    other_app_icon1 = 'fa fa-store';
    other_app_icon2 = 'fa fa-truck';
  } else if (selectedDomainSlug == 'e-commerce-shopping-apps') {
    primary_app_name = 'Vendor App';
    secondary_app_name = 'Delivery App';
    other_app_icon1 = 'fa fa-store';
    other_app_icon2 = 'fa fa-truck';
  } else if (selectedDomainSlug == 'education-and-e-learning') {
    primary_app_name = 'Student App';
    secondary_app_name = 'Teacher App';
    other_app_icon1 = 'fa fa-user-graduate';
    other_app_icon2 = 'fas fa-chalkboard-teacher';
  } else if (selectedDomainSlug == 'food-delivery') {
    primary_app_name = 'Vendor App';
    secondary_app_name = 'Delivery App';
    other_app_icon1 = 'fa fa-store';
    other_app_icon2 = 'fa fa-truck';
  } else if (selectedDomainSlug == 'iot') {
    primary_app_name = '';
    secondary_app_name = '';
    other_app_icon1 = '';
    other_app_icon2 = '';
  } else if (selectedDomainSlug == 'lifestyle-health-and-fitness') {
    primary_app_name = 'Coach App';
    secondary_app_name = 'Manager App';
    other_app_icon1 = 'fa fa-user-tie';
    other_app_icon2 = 'fa fa-user';
  } else if (selectedDomainSlug == 'ngo-fundraising') {
    primary_app_name = 'Manager App';
    secondary_app_name = 'Organizer App';
    other_app_icon1 = 'fa fa-user-tie';
    other_app_icon2 = 'fa fa-user';
  } else if (selectedDomainSlug == 'productivity') {
    primary_app_name = '';
    secondary_app_name = '';
    other_app_icon1 = '';
    other_app_icon2 = '';
  } else if (selectedDomainSlug == 'real-estate') {
    primary_app_name = 'Broker App';
    secondary_app_name = 'Manager App';
    other_app_icon1 = 'fas fa-user';
    other_app_icon2 = 'fa fa-user-tie';
  } else if (selectedDomainSlug == 'service-apps-eg-urbanclap') {
    primary_app_name = 'Vendor App';
    secondary_app_name = 'Delivery App';
    other_app_icon1 = 'fa fa-store';
    other_app_icon2 = 'fa fa-truck';
  } else if (selectedDomainSlug == 'social-networking-social-media-sharing') {
    primary_app_name = 'Merchant App';
    secondary_app_name = '';
    other_app_icon1 = 'far fa-store';
    other_app_icon2 = '';
  } else if (selectedDomainSlug == 'transport-logistics-management') {
    primary_app_name = 'Driver App';
    secondary_app_name = 'Transporter App';
    other_app_icon1 = 'fa-solid fa-steering-wheel';
    other_app_icon2 = 'fa fa-truck';
  }
  var is_primary_app = '';
  var is_secondary_app = '';
  var secondaryAppPlatforms = [];
  var app_primary_cost = 0; var app_secondary_cost = 0;

  console.log('other_apps length  ----------->'+other_apps.length);
  let secondary_app_estimation, otherapp_selected;
  if(request_from == "app"){
    secondary_app_estimation = data.secondary_app_estimation
    console.log('sec app hrs --->'+data.secondary_app_estimation);
    otherapp_selected = data.OtherAppData
    console.log('length --> '+otherapp_selected.length);
    otherapp_selected.map(item =>{
      if(item.slug == "primary_app"){
        primary_app_efforts = (otherapp_selected.length == 1)?secondary_app_estimation:parseFloat(secondary_app_estimation)/2;
        console.log("primary_app_efforts -->"+primary_app_efforts);
        var pltFrm = {
          title: item.nameApp,
          app_icon: other_app_icon1,
          hours: Math.round(primary_app_efforts)
        }
        app_primary_cost = (primary_app_efforts.toFixed(2) * 10)
        secondaryAppPlatforms.push(pltFrm);
      } else {
        console.log("primary_app_efforts -->"+primary_app_efforts);
        var pltFrm = {
          title: '',
          app_icon: '',
          hours: 0
        }
        primary_app_efforts = 0;
        secondaryAppPlatforms.push(pltFrm);
        primary_app_name = ''
      }
      console.log(secondaryAppPlatforms);
      // =============================================
      if(item.slug == "secondary_app"){
        console.log('in if Secondary_app');
        secondary_app_efforts = (otherapp_selected.length == 1)?secondary_app_estimation:parseFloat(secondary_app_estimation)/2;
        console.log("secondary_app_efforts -->"+secondary_app_efforts);
      var pltFrm = {
        title: item.nameApp,
        app_icon: other_app_icon1,
        hours: Math.round(secondary_app_efforts)
      }
      
      app_secondary_cost = (secondary_app_efforts.toFixed(2) * 10)
      secondaryAppPlatforms.push(pltFrm);
      } else {
        console.log('in if Secondary_app');
        console.log("secondary_app_efforts -->"+secondary_app_efforts);
        var pltFrm = {
          title: '',
          app_icon: '',
          hours: 0
        }
        secondary_app_efforts = 0;
        secondaryAppPlatforms.push(pltFrm);
        secondary_app_name = ''
      }
    })
    console.log(secondaryAppPlatforms);

  } else {
    if (other_apps && other_apps.includes("primary_app")) {
      primary_app_efforts = (other_apps.length >= 1)?other_app_total_hrs:other_app_total_hrs*2;
      var pltFrm = {
        title: primary_app_name,
        app_icon: other_app_icon1,
        hours: Math.round(primary_app_efforts)
      }
      app_primary_cost = (primary_app_efforts.toFixed(2) * 10)
      secondaryAppPlatforms.push(pltFrm);
    } else {
      var pltFrm = {
        title: primary_app_name,
        app_icon: other_app_icon2,
        hours: 0
      }
      primary_app_efforts = 0;
      secondaryAppPlatforms.push(pltFrm);
      primary_app_name = ''
    }

    if (other_apps && other_apps.includes("Secondary_app")) {
      secondary_app_efforts = (other_apps.length >= 1)?other_app_total_hrs:other_app_total_hrs*2;
      var pltFrm = {
        title: secondary_app_name,
        app_icon: other_app_icon1,
        hours: Math.round(secondary_app_efforts)
      }
      
      app_secondary_cost = (secondary_app_efforts.toFixed(2) * 10)
      secondaryAppPlatforms.push(pltFrm);
    } else {
      var pltFrm = {
        title: secondary_app_name,
        app_icon: other_app_icon2,
        hours: 0
      }
      secondary_app_efforts = 0;
      secondaryAppPlatforms.push(pltFrm);
      secondary_app_name = ''
    }
  }
  var secondaryAppHrs = other_apps.length * other_app_total_hrs;
  console.log('other_app_total_hrs --------------> '+other_app_total_hrs);
  console.log('secondaryAppHrs -------------> '+secondaryAppHrs);
  var grandTotalEfforts = 0;
  grandTotalEfforts = parseFloat(uiscreenhrs + frontend_total_hrs + backend_hrs + secondaryAppHrs);
  console.log('grandTotalEfforts -------------> '+grandTotalEfforts);
  var grandTotalCost = 0;
  if (selectedTechnology == "native") {
    grandTotalCost = parseFloat(grandTotalEfforts * 10);
  } else if (selectedTechnology == "CROSS-PLATFORM") {
    // grandTotalCost = parseFloat(((grandTotalEfforts * 10) * 70) / 100);  // of 70% val
    grandTotalCost = parseFloat(((grandTotalEfforts * 10) * 30) / 100);   // of 30% val
  }

  let amt_convertd = 0;
  let currency_rate_value = 0;
  // perform currency conversion
  // let remote_ip_1 = '118.185.160.93';   // change this later

  const geo_data = await getGeoDetails(remote_ip);
  const conversion_data = await getConversionDetails(geo_data.currency_name, grandTotalCost);

  amt_convertd = conversion_data.converted_amt;
  currency_rate_value = conversion_data.currency_rate;
  var timeline_val = grandTotalEfforts / 240;   // 730 hrs for a month
  var dt = datetime.create();
  console.log('=>>>>>>>>>>>>>>>>>> all ok');
  // generate pdf for cost breakups
  let web_application = (web == 1) ? 'Yes' : 'No'
  let user_id_ts = Math.random() * (9999 - 1111) + 350;
  const file_name = "user_pdf-"+Math.round(user_id_ts);
  // const customer_mail_template = "<h1>test pdf for user id "+Math.round(user_id_ts)+"</h1>";
let customer_mail_template = `<!DOCTYPE html>
<html lang="en">
  <head>
  </head>
  <body
    style="font-family: Overpass, sans-serif;box-sizing: border-box;padding: 0;margin:0;">
    <div class="main-container" style="padding:50px;padding-top:0px">
      <div>
        <div>
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/816a3a60-be94-4a51-8144-b5330ff87d59/200x70.png" alt="Creating Email Magic" width="150"/>
          <img src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/1f877a2d-6669-4c59-bcf7-7814894a2474/284x91.png" alt="Creating Email Magic" style="float: right" height="75" />
        </div>
      </div>

      <div class="pg-title" style="text-align: right">
        <h2>MOBILE APP COST CALCULATOR</h2>
      </div>

      <div style="border-top: 2px solid #2a50eb"></div>
      <div style="text-align: center">
        <img src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/d2884548-259c-434c-9406-fbdfdc6e6155/2293x1368.png" style="width: 550px; margin-top: 20px" alt="image" />
      </div>

      <div style="margin-top: 20px; border-bottom: 1px solid #eeeeee">
        <h2 class="heading" style="text-align: center; color: #2a50eb">
          Greetings!
        </h2>
        <p style="font-size: 14px;line-height: 25px;padding: 1px 20px;font-weight: 600;">
          Dear ${data.user_name},
        </p>
        <p style="font-size: 14px;line-height: 25px;padding: 1px 20px;font-weight: 500;">
          Thank you for trusting us to help you find a solution. Please find
          below a high-level Effort and Cost estimation based on your
          preferences.
        </p>
      </div>

      <div style="border-bottom: 2px solid #eeeeee">
        <h2 style="text-align: center;margin: 20px 0;font-size: 20px;font-weight: 600;">
          Application Specifications
        </h2>
      </div>

      <div style="border-bottom: 1px solid #eeeeee">
        <table
          width="100%"
          cell-spacing="0"
          cell-padding="0"
          border-collapse:collapse;>
          <thead>
            <tr style="background-color: #2a50eb; color: #ffffff">
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                App Specifications
              </th>
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                User Preferences
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; padding: 10px">
                Application Category
              </td>
              <td style="text-align: center; padding: 10px">${data.step1_domain_data}</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Platforms Selected
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">${dis_platform}</td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Admin Panel</td>
              <td style="text-align: center; padding: 10px">Yes</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Web Application
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
              ${web_application}
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Secondary App</td>
              <td style="text-align: center; padding: 10px">
              ${primary_app_name} ${secondary_app_name}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="border-bottom: 2px solid #eeeeee">
        <h2 style="text-align: center;margin: 20px;font-size: 20px;font-weight: 600;">
          App Version Specifications
        </h2>
      </div>
      <div style="border-bottom: 1px solid #eeeeee">
        <table
          width="100%"
          cell-spacing="0"
          cell-padding="0"
          border-collapse:collapse;>
          <thead>
            <tr style="background-color: #2a50eb; color: #ffffff">
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                App Version Specifications
              </th>
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                Android
              </th>
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                iOS
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; padding: 10px">Latest Version</td>
              <td style="text-align: center; padding: 10px">11.0</td>
              <td style="text-align: center; padding: 10px">14</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Backward Compatibility
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                6.0
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                12
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Screen Sizes</td>
              <td style="text-align: center; padding: 10px">5.0 -> 6.9</td>
              <td style="text-align: center; padding: 10px">4.7 -> 6.5</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Minimum SDK Version
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Marshmallow - Version-6
                <br />API Level -23
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                -
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">
                Maximum SDK Version
              </td>
              <td style="text-align: center; padding: 10px">
                Android 11 - Version-11 <br />
                API Level -30
              </td>
              <td style="text-align: center; padding: 10px">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="background-color: #f7f7f7;padding: 30px;margin-top: 20px;text-align: center;">
        <h4 style="font-weight: bold;margin-top: 0;font-size: 24px;margin-bottom: 5px;">
          Grand Cost
        </h4>
        <h2 style="margin-top: 0;margin-bottom: 5px;color: #2a50eb;font-size: 30px;letter-spacing: 3px;font-weight: 400;">
          ${Math.round(amt_convertd)} ${conversion_data.currency_name}
        </h2>
        <p style="margin-top: 0; margin-bottom: 30px">
          If this is a bit unexpected, we are keen to help you to reduce this cost, Please answer few more questions.
        </p>
        <div style="text-align: center">
          <div style="height: 56px;line-height: 56px;border: 2px solid #2a50eb;background: #f7f7f7;">
            <span class="cx-ttext" style="font-weight: 600; display: block; font-size: 20px">TIMELINE ${Math.round(timeline_val)} Months (approx.)</span>
          </div>
        </div>
      </div>

      <div style="text-align: center;font-size: 20px;font-weight: bold;padding-top: 20px;padding-bottom: 20px;">
        Cost Breakups
      </div>

      <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;">
        <div style="padding: 25px">
          <div style="width: 10%; float: left">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/999a295f-d448-4fff-a663-4183d66d9958/32x32.png"
            />
          </div>
          <div style="width: 90%; float: right">
            <div style="font-size: 20px; font-weight: bold">${data.step1_domain_data}</div>
            <div style="font-size: 12px; color: #2a50eb; font-weight: bold">
            ${Math.round(grandTotalEfforts)} Hours
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a5707e4f-8f14-440d-8c4f-a3d46fed3d6d/38x38.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
          <div style="padding: 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/b837d2d2-b761-4302-bc30-46c2a6b0f9a8/24x24.png"
                style="margin-top: 10px"
              />
            </div>

            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">
                Screen Design
              </div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: bold">
              ${uiscreenhrs} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a5707e4f-8f14-440d-8c4f-a3d46fed3d6d/38x38.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
          <div style="padding: 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/13113dc1-aaef-4979-ac80-7bebaf534efd/17x24.png"
                style="margin-top: 10px"
              />
            </div>
            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">Front End</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: bold">
                ${Math.round(frontend_total_hrs)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;">
          <div style="padding: 25px" width="100%">
            <div style="width: 33%;float: left;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/ca0b98f9-567b-4dde-b165-84a6d8c06db9/21x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Android</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${Math.round(frontend_android_hrs)} hrs
              </div>
            </div>
            <div style="width: 33%; float: right; text-align: center">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/cd7361c4-29eb-438f-871d-ebad79f028d5/24x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Web App</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${Math.round(frontend_web_hrs)} hrs
              </div>
            </div>
            <div style="width: 33%;float: right;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/ac3c063a-b737-4f8a-ba7a-768c98a6fac6/20x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">iOS</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${Math.round(frontend_ios_hrs)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%"></div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 80%;">
          <div style="padding: 25px" width="100%">
            <div width="100%">
              <div style="text-align: right; padding: 0 10px">
                <h5 style="background: #595856;color: #ffffff;text-align: center;padding-top: 10px;padding-bottom: 10px;">
                  Feature List
                </h5>
              </div>
              <div style="text-align: left; padding: 0 10px">
                <ul style="list-style-type:disc;">${modular_list_full}</ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a5707e4f-8f14-440d-8c4f-a3d46fed3d6d/38x38.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;">
          <div style="padding: 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/7567fc10-9141-4c9c-a7d8-964c80048dc3/21x19.png"
                style="margin-top: 10px"
              />
            </div>
            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">Backend</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: bold">
                ${backend_hrs} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;">
          <div style=" display: flex" width="100%">
            <div style="width: 33%;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/64c904e8-8dd9-4dcf-9bb3-9d1fac9d48b7/27x26.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Web Services</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${webservices_hrs} hrs
              </div>
            </div>
            <div style="width: 33%; text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a5b8b471-37ee-4507-928f-be3daf8eef0b/19x25.png "
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Database</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${Math.round(database_hrs)} hrs
              </div>
            </div>
            <div style="width: 33%;text-align: center;border-right: 1px solid #eeeeee;">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a0f2ed45-38e1-46bc-b320-48a3a6f1b544/20x24.png"
                  style="margin-top: 10px"
                />
              <div style="font-size: 14px; font-weight: 700">Admin Panel</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${admin_panel_hrs}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 80%;padding: 0 60px;">
          <div width="50%" style="float: left">
            <div style="text-align: left; padding: 0 10px">
              <h5 style="background: #595856;color: #ffffff;text-align: center;padding: 10px 30px;">
                Basic Features
              </h5>
            </div>
            <div style="text-align: left; padding: 0 10px">
            <ul>
              ${adminpanel_list_basic}
            </ul>
            </div>
          </div>

          <div width="50%" style="float: right">
            <div style="text-align: left; padding: 0 10px">
              <h5 style="background: #595856;color: #ffffff;text-align: center;padding: 10px 30px;">
                Advance Features
              </h5>
            </div>
            <div style="text-align: left; padding: 0 10px">
            <ul>
              ${adminpanel_list_advance}
            </ul>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px">
        <div style="float: left; width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/a5707e4f-8f14-440d-8c4f-a3d46fed3d6d/38x38.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
          <div style="padding: 25px" width="100%">
            <div style="width: 10%; float: left">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/cc2d22c5-6ae1-4a6c-af0b-6b5f5e0525ab/12x20.png"
                style="margin-top: 10px"
              />
            </div>
            <div style="width: 90%; float: right">
              <div style="font-size: 20px; font-weight: bold">
                Secondary Apps
              </div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: bold">
                ${Math.round(secondaryAppHrs)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px">
        <div style="float: left; width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
          <div style="padding: 25px" width="100%">
            <div style="width: 50%;float: left;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/1475a2cd-9536-4c8e-a65c-ee5afcaa8716/24x19.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">${primary_app_name}</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${Math.round(primary_app_efforts)} hrs
              </div>
            </div>

            <div style="width: 45%; float: right; text-align: center">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/ad18a64f-8fcf-40a1-b0a5-ce892b0df24c/25x22.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">${secondary_app_name}</div>
              <div style="font-size: 12px; color: #2a50eb; font-weight: 600">
                ${Math.round(secondary_app_efforts)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="background-color: #f7f7f7;padding: 30px;margin-top: 20px;text-align: center;">
        <h4 style="font-weight: 600;margin-top: 0;font-size: 24px;margin-bottom: 5px;">
          Grand Total
        </h4>
        <h2 style="margin-top: 0;margin-bottom: 5px;font-size: 30px;letter-spacing: 3px;font-weight: 400;color: #2a50eb;">
          ${Math.round(amt_convertd)} ${conversion_data.currency_name}
        </h2>
        <p style="margin-top: 0; margin-bottom: 30px">
          If this is a bit unexpected, we are keen to help you to reduce this
          cost, Please answer a few more questions.
        </p>
      </div>

      <div style="text-align: center">
        <p style="margin: 30px 0">Try With Our Cost Calculator App</p>
        <span>
          <a href="https://play.google.com/store/apps/details?id=com.redbytes.projectcostcalculator&hl=en&gl=US">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/653dbb03-fb0f-4e75-a95a-c149526d95bb/5436x1604.png"
              style="height: 60px; width: 200px"
            />
          </a>
        </span>
        <span>
          <a href="https://apps.apple.com/gb/app/cost-calculator/id1482880672">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/4f466f9c-90d6-4259-87df-ddf9a8bb2872/1990x590.png"
              style="height: 60px; width: 200px"
            />
          </a>
        </span>

        <p style="text-align: center; margin: 30px 0">
          We hope this estimate is to your satisfaction and offers a
          comprehensive picture. For any further queries, we would be happy to
          respond at
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <table style="width: 100%">
          <tr>
            <td style="" valign="bottom">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/9cfec0a3-e987-4c18-8204-dd7566c48281/30x31.png"
                style="margin-bottom: -9px;"/>
              <span style="margin-left: 5px;">www.cloudxperte.com</span>
            </td>

            <td>
              <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/35e3a74f-0faa-4ecb-a54c-7ac71aec0e62/30x30.png"
              style="margin-bottom: -9px;"/>
              <span style="margin-left: 5px;">+91 81138 62000</span>
            </td>

            <td>
              <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/23566361-0ce0-48ee-a871-a62c95d794e7/31x31.png"
              style="margin-bottom: -9px;"/>
            <span style="margin-left: 5px;">+1 92955 21900</span>
            </td>
          </tr>
        </table>
      </div>

      <div>
        <h2 style="text-align: center;margin-top: 50px;margin-bottom: 10px;font-size: 20px;font-weight: bold;">
          More About App Development
        </h2>
      </div>

      <div style="box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 100%;">
        <div width="100%" style="display: flex; justify-content: center;">
          <div style="width: 40%;text-align: center;border: 1px solid #eeeeee;padding: 20px 0;">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f3ae7fcf-8653-4ba1-baea-56bb18feacd6/27x50.png"
              style="margin-top: 10px; width: 26px"/>
            <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
              How Much
            </div>
          </div>

          <div style="width: 40%;text-align: center;border: 1px solid #eeeeee;padding: 20px 0;">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/533183b4-bf90-460e-8be0-5a8bc47a5a89/243x242.png"
              style="margin-top: 10px; width: 48px"
            />
            <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
              How To
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 50px">
        <h2 style="color: #2a50eb; margin-top: 30px; margin-bottom: 0">
          DISCLAIMER
        </h2>
        <p style="margin-top: 10px">
          We have formulated this model based on Intelligent and Predictive
          analytics and is honed by years of industry experience. We can assure
          you that, based on your present preference, this estimate will be
          about 70-80 % accurate
        </p>
        <span style="color: #2a50eb"
          >Note: This email is generated from App Cost Calculator page -
          CloudXperte
        </span>
      </div>

      <div style="margin-top: 20px" width="100%">
        <div style="float: left; width: 50%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/7a693d2f-6166-40db-b0a2-d95f745c5a52/283x91.png"
            alt="Creating Email Magic"
            height="75"
          />
        </div>
        <div style="float: right; width: 50%; text-align: right">
          <div width="100%">
            <div class="cx-atext" style="text-align: right;margin-right: 5px;float: left;width: 90%;">
              <p style="margin: 0">15, Software Technology Park of India,</p>
              <p style="margin: 0">Chikalthana MIDC,</p>
              <p style="margin: 0">Aurangabad, Maharashtra. 431210</p>
            </div>
            
            <div width="10%" style="float: right">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/109037b9-7454-4f2a-a812-e131afc7e697/31x31.png"
                style="padding-top: 15px"/>
            </div>

          </div>
        </div>
      </div>

      <div style="border-bottom: 2px solid #eeeeee; margin-top: 40px; clear: both;"></div>
    </div>
  </body>
</html>`;

let customer_mail_template_version_red = `<!DOCTYPE html>
<html lang="en">
  <head>
  </head>
  <body
    style="font-family: Overpass, sans-serif;box-sizing: border-box;padding: 0;margin:0;">
    <div class="main-container" style="padding:50px;padding-top:0px">
      <div>
        <div>
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/3acd8747-2022-48cf-99d8-fa02223bcfe8/707x216.png" alt="Creating Email Magic" width="150"/>
          <img src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/1fc7dc6b-b558-40fa-b995-2447bd6cb449/282x90.png" alt="Creating Email Magic" style="float: right" height="75" />
        </div>
      </div>

      <div class="pg-title" style="text-align: right">
        <h2>MOBILE APP COST CALCULATOR</h2>
      </div>

      <div style="border-top: 2px solid #F20101"></div>
      <div style="text-align: center">
        <img src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f37d2286-0b6f-4f40-bf55-5602c0ce53cc/852x508.png" style="width: 550px; margin-top: 20px" alt="image" />
      </div>

      <div style="margin-top: 20px; border-bottom: 1px solid #eeeeee">
        <h2 class="heading" style="text-align: center; color: #F20101">
          Greetings!
        </h2>
        <p style="font-size: 14px;line-height: 25px;padding: 1px 20px;font-weight: 600;">
          Dear ${data.user_name},
        </p>
        <p style="font-size: 14px;line-height: 25px;padding: 1px 20px;font-weight: 500;">
          Thank you for trusting us to help you find a solution. Please find
          below a high-level Effort and Cost estimation based on your
          preferences.
        </p>
      </div>

      <div style="border-bottom: 2px solid #eeeeee">
        <h2 style="text-align: center;margin: 20px 0;font-size: 20px;font-weight: 600;">
          Application Specifications
        </h2>
      </div>

      <div style="border-bottom: 1px solid #eeeeee">
        <table
          width="100%"
          cell-spacing="0"
          cell-padding="0"
          border-collapse:collapse;>
          <thead>
            <tr style="background-color: #F20101; color: #ffffff">
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                App Specifications
              </th>
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                User Preferences
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; padding: 10px">
                Application Category
              </td>
              <td style="text-align: center; padding: 10px">${data.step1_domain_data}</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Platforms Selected
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">${dis_platform}</td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Admin Panel</td>
              <td style="text-align: center; padding: 10px">Yes</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Web Application
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
              ${web_application}
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Secondary App</td>
              <td style="text-align: center; padding: 10px">
              ${primary_app_name} ${secondary_app_name}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="border-bottom: 2px solid #eeeeee">
        <h2 style="text-align: center;margin: 20px;font-size: 20px;font-weight: 600;">
          App Version Specifications
        </h2>
      </div>
      <div style="border-bottom: 1px solid #eeeeee">
        <table
          width="100%"
          cell-spacing="0"
          cell-padding="0"
          border-collapse:collapse;>
          <thead>
            <tr style="background-color: #F20101; color: #ffffff">
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                App Version Specifications
              </th>
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                Android
              </th>
              <th style="text-transform: uppercase; padding: 10px; color: #ffffff">
                iOS
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; padding: 10px">Latest Version</td>
              <td style="text-align: center; padding: 10px">11.0</td>
              <td style="text-align: center; padding: 10px">14</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Backward Compatibility
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                6.0
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                12
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">Screen Sizes</td>
              <td style="text-align: center; padding: 10px">5.0 -> 6.9</td>
              <td style="text-align: center; padding: 10px">4.7 -> 6.5</td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Minimum SDK Version
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                Marshmallow - Version-6
                <br />API Level -23
              </td>
              <td style="text-align: center; background: #f7f7f7; padding: 10px">
                -
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px">
                Maximum SDK Version
              </td>
              <td style="text-align: center; padding: 10px">
                Android 11 - Version-11 <br />
                API Level -30
              </td>
              <td style="text-align: center; padding: 10px">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="background-color: #f7f7f7;padding: 30px;margin-top: 20px;text-align: center;">
        <h4 style="font-weight: bold;margin-top: 0;font-size: 24px;margin-bottom: 5px;">
          Grand Cost
        </h4>
        <h2 style="margin-top: 0;margin-bottom: 5px;color: #F20101;font-size: 30px;letter-spacing: 3px;font-weight: 400;">
          ${Math.round(amt_convertd)} ${conversion_data.currency_name}
        </h2>
        <p style="margin-top: 0; margin-bottom: 30px">
          If this is a bit unexpected, we are keen to help you to reduce this cost, Please answer few more questions.
        </p>
        <div style="text-align: center">
          <div style="height: 56px;line-height: 56px;border: 2px solid #F20101;background: #f7f7f7;">
            <span class="cx-ttext" style="font-weight: 600; display: block; font-size: 20px">TIMELINE ${Math.round(timeline_val)} Months (approx.)</span>
          </div>
        </div>
      </div>

      <div style="text-align: center;font-size: 20px;font-weight: bold;padding-top: 20px;padding-bottom: 20px;">
        Cost Breakups
      </div>

      <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;">
        <div style="padding: 25px">
          <div style="width: 10%; float: left">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/92bfbb0a-831d-455a-856f-7de0bb1d36d8/32x32.png"
            />
          </div>
          <div style="width: 90%; float: right">
            <div style="font-size: 20px; font-weight: bold">${data.step1_domain_data}</div>
            <div style="font-size: 12px; color: #F20101; font-weight: bold">
            ${Math.round(grandTotalEfforts)} Hours
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f022be81-8d7d-40b6-92e7-598b62c8fa53/30x30.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
          <div style="padding: 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/14c989c2-5bb2-40a3-bc23-d621edb508db/24x24.png"
                style="margin-top: 10px"
              />
            </div>

            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">
                Screen Design
              </div>
              <div style="font-size: 12px; color: #F20101; font-weight: bold">
              ${uiscreenhrs} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f022be81-8d7d-40b6-92e7-598b62c8fa53/30x30.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
          <div style="padding: 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/29a67025-65e8-4a71-a313-8b104cdee317/26x36.png"
                style="margin-top: 10px"
              />
            </div>
            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">Front End</div>
              <div style="font-size: 12px; color: #F20101; font-weight: bold">
                ${Math.round(frontend_total_hrs)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;">
          <div style="padding: 25px" width="100%">
            <div style="width: 33%;float: left;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/6f46607e-2437-4a71-b255-521db2babb06/21x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Android</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${Math.round(frontend_android_hrs)} hrs
              </div>
            </div>
            <div style="width: 33%; float: right; text-align: center">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/d649217b-4b59-497f-ad56-b4d353cec59f/24x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Web App</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${Math.round(frontend_web_hrs)} hrs
              </div>
            </div>
            <div style="width: 33%;float: right;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/b19a6fd8-fc93-4dd7-b300-2a8242390cc8/20x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">iOS</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${Math.round(frontend_ios_hrs)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%"></div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 80%;">
          <div style="padding: 25px" width="100%">
            <div width="100%">
              <div style="text-align: right; padding: 0 10px">
                <h5 style="background: #595856;color: #ffffff;text-align: center;padding-top: 10px;padding-bottom: 10px;">
                  Feature List
                </h5>
              </div>
              <div style="text-align: left; padding: 0 10px">
                <ul style="list-style-type:disc;">${modular_list_full}</ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f022be81-8d7d-40b6-92e7-598b62c8fa53/30x30.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;">
          <div style="padding: 25px; display: flex" width="100%">
            <div style="width: 10%">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/67452889-614e-475b-8f9e-0d80f6253686/21x19.png"
                style="margin-top: 10px"
              />
            </div>
            <div style="width: 90%">
              <div style="font-size: 20px; font-weight: bold">Backend</div>
              <div style="font-size: 12px; color: #F20101; font-weight: bold">
                ${backend_hrs} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;">
          <div style=" display: flex" width="100%">
            <div style="width: 33%;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/3c9d11c9-530d-45a2-8f0b-82154359a03a/24x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Web Services</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${webservices_hrs} hrs
              </div>
            </div>
            <div style="width: 33%; text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/e8c42d7f-f637-4a6d-afd7-ed1368c89993/19x24.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">Database</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${Math.round(database_hrs)} hrs
              </div>
            </div>
            <div style="width: 33%;text-align: center;border-right: 1px solid #eeeeee;">
                <img
                  src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/b1c7b097-c357-4726-993e-9579962b90b3/20x24.png"
                  style="margin-top: 10px"
                />
              <div style="font-size: 14px; font-weight: 700">Admin Panel</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${admin_panel_hrs}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px; display: flex">
        <div style="width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 80%;padding: 0 60px;">
          <div width="50%" style="float: left">
            <div style="text-align: left; padding: 0 10px">
              <h5 style="background: #595856;color: #ffffff;text-align: center;padding: 10px 30px;">
                Basic Features
              </h5>
            </div>
            <div style="text-align: left; padding: 0 10px">
            <ul>
              ${adminpanel_list_basic}
            </ul>
            </div>
          </div>

          <div width="50%" style="float: right">
            <div style="text-align: left; padding: 0 10px">
              <h5 style="background: #595856;color: #ffffff;text-align: center;padding: 10px 30px;">
                Advance Features
              </h5>
            </div>
            <div style="text-align: left; padding: 0 10px">
            <ul>
              ${adminpanel_list_advance}
            </ul>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px">
        <div style="float: left; width: 20%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/f022be81-8d7d-40b6-92e7-598b62c8fa53/30x30.png"
            style="padding-left: 25px; margin-top: 25px"
          />
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
          <div style="padding: 25px" width="100%">
            <div style="width: 10%; float: left">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/1c44ecea-e05b-4202-a5fa-ec676afc4694/12x20.png"
                style="margin-top: 10px"
              />
            </div>
            <div style="width: 90%; float: right">
              <div style="font-size: 20px; font-weight: bold">
                Secondary Apps
              </div>
              <div style="font-size: 12px; color: #F20101; font-weight: bold">
                ${Math.round(secondaryAppHrs)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="margin-top: 20px">
        <div style="float: left; width: 20%">
          <span style="padding-left: 25px; margin-top: 25px"></span>
        </div>
        <div style="background-color: #f7f7f7;box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);height: 100px;width: 80%;float: right;">
          <div style="padding: 25px" width="100%">
            <div style="width: 50%;float: left;text-align: center;border-right: 1px solid #eeeeee;">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/fe30a452-84cd-4e34-905c-ef88af8c85d6/24x19.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">${primary_app_name}</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${Math.round(primary_app_efforts)} hrs
              </div>
            </div>

            <div style="width: 45%; float: right; text-align: center">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/58aab597-765d-4c63-a728-9cec635f4ca6/25x22.png"
                style="margin-top: 10px"
              />
              <div style="font-size: 14px; font-weight: 700">${secondary_app_name}</div>
              <div style="font-size: 12px; color: #F20101; font-weight: 600">
                ${Math.round(secondary_app_efforts)} hrs
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px">
        <img
          src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/22d7d05a-5e2b-4a5a-bc46-48680e2d5902/7x26.png"
          style="padding: 0 0 0 60%"
        />
      </div>

      <div style="background-color: #f7f7f7;padding: 30px;margin-top: 20px;text-align: center;">
        <h4 style="font-weight: 600;margin-top: 0;font-size: 24px;margin-bottom: 5px;">
          Grand Total
        </h4>
        <h2 style="margin-top: 0;margin-bottom: 5px;font-size: 30px;letter-spacing: 3px;font-weight: 400;color: #F20101;">
          ${Math.round(amt_convertd)} ${conversion_data.currency_name}
        </h2>
        <p style="margin-top: 0; margin-bottom: 30px">
          If this is a bit unexpected, we are keen to help you to reduce this
          cost, Please answer a few more questions.
        </p>
      </div>

      <div style="text-align: center">
        <p style="margin: 30px 0">Try With Our Cost Calculator App</p>
        <span>
          <a href="https://play.google.com/store/apps/details?id=com.redbytes.projectcostcalculator&hl=en&gl=US">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/653dbb03-fb0f-4e75-a95a-c149526d95bb/5436x1604.png"
              style="height: 60px; width: 200px"
            />
          </a>
        </span>
        <span>
          <a href="https://apps.apple.com/gb/app/cost-calculator/id1482880672">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/4f466f9c-90d6-4259-87df-ddf9a8bb2872/1990x590.png"
              style="height: 60px; width: 200px"
            />
          </a>
        </span>

        <p style="text-align: center; margin: 30px 0">
          We hope this estimate is to your satisfaction and offers a
          comprehensive picture. For any further queries, we would be happy to
          respond at
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <table style="width: 100%">
          <tr>
            <td style="" valign="bottom">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/ed580ade-ae61-4f9b-95d7-5fc7f9f9e486/30x30.png"
                style="margin-bottom: -9px;"/>
              <span style="margin-left: 5px;">www.redbytes.in</span>
            </td>

            <td>
              <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/35e3a74f-0faa-4ecb-a54c-7ac71aec0e62/30x30.png"
              style="margin-bottom: -9px;"/>
              <span style="margin-left: 5px;">+91 8113 869 000</span>
            </td>

            <td>
              <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/c4d830a2-cc39-4dc8-8679-05a8527a939a/30x30.png"
              style="margin-bottom: -9px;"/>
            <span style="margin-left: 5px;">+1 9295521900</span>
            </td>
          </tr>
        </table>
      </div>

      <div>
        <h2 style="text-align: center;margin-top: 50px;margin-bottom: 10px;font-size: 20px;font-weight: bold;">
          More About App Development
        </h2>
      </div>

      <div style="box-sizing: border-box;box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.05);width: 100%;">
        <div width="100%" style="display: flex; justify-content: center;">
          <div style="width: 40%;text-align: center;border: 1px solid #eeeeee;padding: 20px 0;">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/95ff66f0-7260-4127-ba67-63d065f78e02/100x192.png"
              style="margin-top: 10px; width: 26px"/>
            <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
              How Much
            </div>
          </div>

          <div style="width: 40%;text-align: center;border: 1px solid #eeeeee;padding: 20px 0;">
            <img
              src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/ecff8b2b-32b4-4d09-9700-78865298bd88/243x243.png"
              style="margin-top: 10px; width: 48px"
            />
            <div style="font-size: 14px; font-weight: 700; margin-top: 10px">
              How To
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 50px">
        <h2 style="color: #F20101; margin-top: 30px; margin-bottom: 0">
          DISCLAIMER
        </h2>
        <p style="margin-top: 10px">
          We have formulated this model based on Intelligent and Predictive
          analytics and is honed by years of industry experience. We can assure
          you that, based on your present preference, this estimate will be
          about 70-80 % accurate
        </p>
        <span style="color: #F20101"
          >Note: This email is generated from App Cost Calculator page -
          Redbytes
        </span>
      </div>

      <div style="margin-top: 20px" width="100%">
        <div style="float: left; width: 50%">
          <img
            src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/9315d5c0-eac8-44fa-8bc2-ee4388763831/282x90.png"
            alt="Creating Email Magic"
            height="75"
          />
        </div>
        <div style="float: right; width: 50%; text-align: right">
          <div width="100%">
            <div class="cx-atext" style="text-align: right;margin-right: 5px;float: left;width: 90%;">
              <p style="margin: 0">125/2, Sainiketan Colony, kalas Road,</p>
              <p style="margin: 0">Visharant Wadi,</p>
              <p style="margin: 0">Pune, Maharashtra 411015.</p>
            </div>
            
            <div width="10%" style="float: right">
              <img
                src="http://cdn.mcauto-images-production.sendgrid.net/975370a36813dc8d/74801c97-6e6e-440f-b0c2-83bb8f58695f/30x30.png"
                style="padding-top: 15px"/>
            </div>

          </div>
        </div>
      </div>

      <div style="border-bottom: 2px solid #eeeeee; margin-top: 40px; clear: both;"></div>
    </div>
  </body>
</html>`;

let pdf_file_path = '';

  if(template_version == "red"){
    console.log('inside if for red version');
    pdf_file_path = await html_to_pdf(file_name, customer_mail_template_version_red,origin);

  } else{
    pdf_file_path = await html_to_pdf(file_name, customer_mail_template,origin);

  }
  console.log('pdf_file_path = ',pdf_file_path);
  // =========================================== 

  var enq_date = dt.format('D f Y, H:M:S');

  var sqlquery = 'INSERT INTO app_cost_calculator (user_id, domain_id, is_android, is_ios, is_web, functional_features, non_functional_features, admin_features, ff_basic_list, ff_advance_list, nff_basic_list, nff_advance_list, adm_basic_list, adm_advance_list, frontend_efforts, android_efforts, ios_efforts, web_efforts, db_efforts,	webservices_efforts, adm_panel_efforts, backend_efforts, secondaryapp_efforts, other_app_names, total_cost, total_efforts, is_vendor_app,	is_delivery_app, currency_code, modular_features ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )';
  var params = [user_id, step1_domain_data, android, ios, web, functionalFeatures, nonFunctionalFeatures, adminPanelFeatures, functionalFeaturesBasic, functionalFeaturesAdvance, nonFunctionalFeaturesBasic, nonFunctionalFeaturesAdvance, adminPanelFeaturesBasic, adminPanelFeaturesAdvance, Math.round(frontend_total_hrs), Math.round(frontend_android_hrs), Math.round(frontend_ios_hrs), Math.round(frontend_web_hrs), Math.round(database_hrs), webservices_hrs, admin_panel_hrs, backend_hrs, Math.round(secondaryAppHrs), primary_app_name+', '+secondary_app_name, Math.round(amt_convertd), grandTotalEfforts, app_primary, app_secondary, conversion_data.currency_name, JSON.stringify(modular_list) ];
  var rows = await db.dbQuery(sqlquery, params);
  // var data_pdf_path = await fetchGetMethod('save_pdf_estimation?user_id=' + user_id);

  console.log('================>>>>>>>>>>');
  // console.log(secondaryAppPlatforms[0].title+' '+secondaryAppPlatforms[1].title);
  
  // const SENDGRID_APY_KEY = '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';
  const SENDGRID_APY_KEY = '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';
  sgMail.setApiKey(SENDGRID_APY_KEY);
  let theme_template_id = ''
  let to_email_id = '';
  if(template_version == 'red'){
    // theme_template_id = 'd-abf2a645b7bc49a188b9d6897fe7d5de'
    // to_email_id = 'info@redbytes.in'
    theme_template_id = 'd-a83ad33e0ec4461497bd12e90e01d15b'
    to_email_id = 'accounts@cloudxperte.com'
  } else{
    // theme_template_id = 'd-f971102512bf466f98a46bc21446dec1';
    // to_email_id = 'info@cloudxperte.com'
    theme_template_id = 'd-52b69a7d99fd473abae3a35030ebb109';
    to_email_id = 'accounts@cloudxperte.com'
  }
 
  request(pdf_file_path, { encoding: null }, (err, res, body) => {
    if (err) { return err; }
    if (body) {
      const textBuffered = Buffer.from(body);
      console.log("user-mail==========n ",data.user_email)
    const msg = {
      // to: 'shubhangiramekar48@gmail.com',
      to: data.user_email, // Change to your recipient
      from: to_email_id, // Change to your verified sender
      subject: 'Mobile App Cost Estimation',
      templateId: theme_template_id,   // set template ID
      // templateId: 'd-f971102512bf466f98a46bc21446dec1',   // set template ID
      dynamicTemplateData: {      // send required inputs/keys here
        rb_user_name: data.user_name,
        catagory_text: data.step1_domain_data,
        selected_platform: dis_platform,
        admin_panel: 'Yes',   // need inputs
        web_application: (web == 1) ? 'Yes' : 'No',   // need inputs  based on web platform selection
        secondary_app: primary_app_name + ' ' + secondary_app_name,

        grand_cost: Math.round(amt_convertd)+' '+conversion_data.currency_name,  // round off the val
        timeline: Math.round(timeline_val) + ' Months',// ref google
        approx_cost: (Math.round(amt_convertd) - 3455)+ ' '+conversion_data.currency_name, // skip this
        category_name: data.step1_domain_data,
        total_effort: Math.round(grandTotalEfforts),
        screen_design_effort: uiscreenhrs,
        front_end_effort: Math.round(frontend_total_hrs),
        android_effort: Math.round(frontend_android_hrs),
        ios_effort: Math.round(frontend_ios_hrs),
        web_app_effort:Math.round(frontend_web_hrs),
        database_effort: Math.round(database_hrs),
        module_list: module_list_full,
        site_link:'www.cloudxperte.com',

        backend_effort: backend_hrs,
        web_services_effort: webservices_hrs,
        admin_panel_effort: admin_panel_hrs,
        adminpanel_basic_features: adminpanel_list_basic,
        adminpanel_advance_features: adminpanel_list_advance,

        secondary_app_effort: Math.round(secondaryAppHrs),
        first_app: secondaryAppPlatforms[0].title,
        first_app_efforts: Math.round(primary_app_efforts),
        second_app: secondaryAppPlatforms[1].title,
        second_app_efforts: Math.round(secondary_app_efforts),
        basic_feature_list_functional_features:functional_list_basic,
        advance_feature_list_functional_features:functional_list_advance,
        basic_feature_list_non_functional_features:nonfunctional_list_basic,
        advance_feature_list_non_functional_features:nonfunctional_list_advance,

        // reduction details
        user_inputs_1:"",
        before_document:"-",
        after_document:"-",

        user_inputs_2: "-",
        before_cloud_service:"-",
        after_cloud_service:"-",

        user_inputs_3: "-",
        before_Tech_service:"-",
        after_Tech_service:"-",

        user_inputs_4: "-",
        before_screen_deisgn:"-",
        after_screen_deisgn:"-",

        user_inputs_5: "-",
        before_timeline_service:"-",
        after_timeline_service:"-",

        saved_cost:"-",
        reduced_cost:"-"
      },
      attachments: [
        {
          content: textBuffered.toString('base64'),
          filename: 'attachment.pdf',
          type: 'application/pdf',
          disposition: 'attachment',
          content_id: 'mytext',
        },
      ],
    }
    sgMail
      .send(msg)
      .then((response) => {
        console.log("mail-response======= ",response)
        console.log('mail sent');
      })
      .catch((error) => {
        console.log('mail not sent');
      })
      }
});

// save lead in CRM
// array to string inputs
var functionalFeaturesBasic_arr = step3_feature_data.basic_feature;
var functionalFeaturesAdvance_arr = step3_feature_data.advance_feature;
const functional_features = functionalFeaturesBasic_arr.concat(functionalFeaturesAdvance_arr);  
var current_date = new Date().toJSON().slice(0,10);  
var today = new Date(); 
var current_time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var current_date_for_enq = current_date+' '+current_time;

var res_status = false;
var res_msg = '';
var options_inputs = {
  'method': 'POST',
  'url': 'https://admin.officecaller.com/api/leads/website_lead/',
  'headers': {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    "title": data.user_name,
    "first_name": data.user_name,
    "email": data.user_email,
    "phone": data.user_contact,
    "city": geo_data.city_name+', '+geo_data.country_name,
    "state": "",
    "country": geo_data.country_name, // get this dynamic
    "address_line": "",
    "latitude": "46412",
    "longitude": "12345",
    "contact_lead": "-",
    "app_category": data.step1_domain_data,
    "category_text": data.step1_domain_data,
    "app_platform": dis_platform,
    "cross_platfrom_status": "Yes",
    "which_cross_platform": "Native",
    "grand_cost": Math.round(amt_convertd)+' '+conversion_data.currency_name,
    "enq_date": current_date_for_enq,
    "favourite": "favourite here",
    "enq_through": "app OR web",  // need input
    "enq_from": source_and_medium_url,
    "enquiryfrom": source_and_medium_url,
    "country_code": geo_data.flag_code,
    "choosen_approach": "Native",
    "choosen_devices": "Smartphones",
    "choosen_screen_count": 10,   // need inputs
    "choosen_login_methods": [],  // need inputs
    "choosen_features": functional_features,
    "choosen_language": "Multiple", 
    "choosen_admin": "Yes ",  
    "admin_efforts": admin_panel_hrs,
    "choosen_webapp": (web == 1)?"Yes":"No",
    "secondary_app": (app_primary == 1 || app_secondary == 1)?"No":"Yes", 
    "screen_efforts": uiscreenhrs,
    "webservices": Math.round(webservices_hrs),
    "webapp_efforts": Math.round(frontend_web_hrs),
    "ios_efforts": Math.round(frontend_ios_hrs),
    "android_efforts": Math.round(frontend_android_hrs),
    "crossplatform_efforts": 0,
    "secondary_app_efforts": Math.round(other_app_total_hrs),
    "features_efforts": 0,    // need inputs
    "database_efforts": Math.round(database_hrs),
    "grand_total_efforts": Math.round(grandTotalEfforts),
    "approx_cost": Math.round(grandTotalEfforts)+ ' '+conversion_data.currency_name,  
    "timeline_month": Math.round(timeline_val)+' Months',    
    "user_comment": data.user_message,
    "mail_date": current_date_for_enq,
    "apikey": "7dac0fcac909b349"
  })

};
request(options_inputs, function (error, response) {
  if (error) throw new Error(error);
  res_msg = response.body;
}); 

  var result = {
    status: "all ok with api v10",
    UPF_val: UPF,
    CAF_val: CAF,
    functionalPoint_val: functionalPoint,
    functionalFeature_cnt: functionalFeature_cnt, // ok
    screenDesignHours: uiscreenhrs,    // ok
    frontend: {
      totalHoursFrontend: frontend_total_hrs.toFixed(2),   // ok
      platforms: frontendPlatForms,   // ok
      functionalFeatures: step3_feature_data,   // ok
      nonFunctionalFeatures: step4_NonFunctional_data   // ok
    },
    backend: {
      totalHours: backend_hrs.toFixed(2),   // ok
      platforms: backendPlatforms,   // ok
      functionalFeatures: adminPanel_data   // ok
    },
    secondaryApp: {
      totalHours: (request_from == 'app')?secondary_app_estimation:secondaryAppHrs,   // ok
      platforms: secondaryAppPlatforms  
    },
    totalEfforts: grandTotalEfforts.toFixed(2),
    grandTotalCost: amt_convertd.toFixed(2),
    currencyName:conversion_data.currency_name,
    singleAppefforts: total_hrs_for_single_app.toFixed(2),
    webAppEfforts: fn_nfn_hrs_total.toFixed(2),
    appOneCost: app_primary_cost.toFixed(2),
    appTwoCost: app_secondary_cost.toFixed(2),
    selectedTechnology: selectedTechnology,
    user_id: user_id,  
    fn_nfn_hrs_total: fn_nfn_hrs_total,
    domanComplexityValue: domanComplexityValue,
    selectedDomainSlug: selectedDomainSlug,
    module_list:module_list_selected,
    domain_img: 'https://www.redbytes.co.uk/wp-content/themes/redbytes_uk/images/' + selectedDomainSlug + '.png'
  }
  return result;
}

const html_to_pdf = async(file_name, mail_template,origin) => {
  console.log('inside pdf function');
  // Example of options with args
  let options = { format: 'A4', printBackground : true, displayHeaderFooter:false, 
  margin: { top: '80px', bottom: '80px'},};
  let file = { content: mail_template };
  return new Promise(resolve => {
    console.log("pdf called successfully")
  //     // To convert HTML page to PDF using generatePdf method:
      html_pdf_node.generatePdf(file, options, (err, pdfBuffer) => {
        console.log("PDF Buffer:-");
          if(pdfBuffer && !err){
              fs.writeFile((path.join(__dirname ,`../public/uploads/${origin == 'http://localhost:3000' ? 'temp' : 'cost-breakup-pdfs'}/${file_name}.pdf`)), pdfBuffer, (err) => {
                  if (err){
                      resolve("Failed to write content in PDF !")
                  }else{
                      // resolve("pdf created successfully")
                      resolve(`https://costcalculator.redbytes.in/uploads/${origin == 'http://localhost:3000' ? 'temp' : 'cost-breakup-pdfs'}/${file_name}.pdf`)
                  }
              })
          }else{
              resolve("Failed to generate PDF !")
          }
      });
  });
}

const saveLead = async (data) => {
  // array to string inputs
  const functional_features = functionalFeaturesBasic.concat(functionalFeaturesAdvance);  //ok
  var current_date = new Date().toJSON().slice(0,10);  
  var today = new Date(); 
  var current_time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var current_date_for_enq = current_date+' '+current_time;
  
  var res_status = false;
  var res_msg = '';
  var options_inputs = {
    'method': 'POST',
    'url': 'https://admin.officecaller.com/api/leads/website_lead/',
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      "title": data.user_name,
      "first_name": data.user_name,
      "email": data.user_email,
      "phone": data.user_contact,
      "city": "",
      "state": "",
      "country": "India", // get this dynamic
      "address_line": "",
      "latitude": "46412",
      "longitude": "12345",
      "contact_lead": "Test Contact Lead",
      "app_category": data.step1_domain_data,
      "category_text": data.step1_domain_data,
      "app_platform": dis_platform,
      "cross_platfrom_status": "Yes",
      "which_cross_platform": "Native",
      "grand_cost": Math.round(grandTotalCost),
      "enq_date": current_date_for_enq,
      "favourite": "favourite here",
      "enq_through": "app OR web",  // need input
      "enq_from": data.user_name,
      "enquiryfrom": data.user_name,
      "country_code": "IN",
      "choosen_approach": "Native",
      "choosen_devices": "Smartphones",
      "choosen_screen_count": 10,   // need inputs
      "choosen_login_methods": [],  // need inputs
      "choosen_features": functional_features,
      "choosen_language": "Multiple", // need inputs
      "choosen_admin": "Yes ",  // set based on web platform selection
      "admin_efforts": admin_panel_hrs,   // set input
      "choosen_webapp": (web == 1)?"Yes":"No",    // need inputs
      "secondary_app": (app_primary == 1 || app_secondary == 1)?"No":"Yes",     // set based on other app selection
      "screen_efforts": uiscreenhrs,
      "webservices": Math.round(webservices_hrs),
      "webapp_efforts": Math.round(frontend_web_hrs),
      "ios_efforts": Math.round(frontend_ios_hrs),
      "android_efforts": Math.round(frontend_android_hrs),
      "crossplatform_efforts": 0,
      "secondary_app_efforts": Math.round(secondaryAppHrs),
      "features_efforts": 0,    // need inputs
      "database_efforts": Math.round(database_hrs),
      "grand_total_efforts": Math.round(grandTotalEfforts),
      "approx_cost": Math.round(grandTotalEfforts)+" USD",   // need inputs
      "timeline_month": Math.round(timeline_val)+' Months',    // set based on efforts
      "user_comment": data.user_comment,
      "mail_date": current_date_for_enq,
      "apikey": "7dac0fcac909b349"
    })

  };
  // console.log(options_inputs);
  request(options_inputs, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    res_msg = response.body;
  }); 
  return { status: true };
}

const getContactMeOptions = async () => {
  // following email sending snippet works fine 
  /*const SENDGRID_APY_KEY = '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';
  sgMail.setApiKey(SENDGRID_APY_KEY);
  var fileURl = 'https://www.redbytes.co.uk/wp-content/themes/redbytes_uk/images/pdf-download/test2-pdf1661407907.pdf';

  request(fileURl, { encoding: null }, (err, res, body) => {
    if (err) { return err; }
    if (body) {
      const textBuffered = Buffer.from(body);
  
      const msg = {
        to: 'shubhangiramekar48@gmail.com',
        from: 'info@redbytes.in',
        subject: 'Attachment',
        html: '<p>Here’s an attachment for you!</p>',
        attachments: [
          {
            content: textBuffered.toString('base64'),
            filename: 'some-attachment.pdf',
            type: 'application/pdf',
            disposition: 'attachment',
            content_id: 'mytext',
          },
        ],
      };
      // send msg here
      sgMail
      .send(msg)
      .then((response) => {
        // return res.status(200).json({ status: true, message: "success" })
        console.log("success");
      })
      .catch((error) => {
        // return res.status(500).json({ status: false, message: error })
        console.log("error");
      })
    }
  });*/
  // ==========================================================

  // let pdf_contents = [{
  //   html_body:'<h1>Contact me on Email</h1>'
  // }];
  // let html_body = '<h1>Contact me on Email</h1>';
  // var data_pdf_path = await fetchPostMethod('https://www.redbytes.co.uk/wp-json/calculatorapi/save_pdf',html_body);
  // console.log(data_pdf);

  // below snippet works fine
  /* var uid = 1094;
  var data_pdf_path = await fetchGetMethod('save_pdf?user_id=' + uid);
  console.log(data_pdf_path); */

  /*let contactme_arr_json = [
    { 'display_label': 'Contact me on Email', 'icon_class': 'fa fa-envelope', 'bg_value': "email" },
    { 'display_label': 'Contact me on Phone', 'icon_class': 'fab fa-apple', 'bg_value': "phone" },
    { 'display_label': 'Contact me on WhatsApp', 'icon_class': 'fa fa-globe', 'slug': "whatsApp" },
    { 'display_label': 'Contact me on Phone / Email / WhatsApp', 'icon_class': 'fa fa-globe', 'slug': "phone_email_whatsApp" },
    { 'display_label': 'Share my details with other organizations.', 'icon_class': 'fa fa-globe', 'slug': "organizations" },
    { 'display_label': 'Do not contact me, just checking prices', 'icon_class': 'fa fa-globe', 'slug': "checking_only" },
  ];
  return contactme_arr_json; */

  /* get converted currency based on country * ===============
  let currency_val = '';
  let converted_amt = 0;
  var options = {
    'method': 'GET',
    'url': 'https://ipapi.co/currency',
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    if(response.body){
      currency_val = response.body;
    }
  });

  (async () => {
    console.log("function invoked...")
    await sleep(2000);
    // currencylayer api call
    var API_ACCESS_KEY = '9bd9736ae23ee331efd18f4a1f17156e';
    var currency_from = 'USD';
    var currency_to = currency_val;
    var base_amount_to_convert = 1100;
    var api_for_convert = 'https://api.currencylayer.com/convert?access_key=' + API_ACCESS_KEY + '&from='+currency_from+'&to='+currency_to+'&amount='+base_amount_to_convert+'';
    var get_currency_layer_result = await fetchGetMethod_forCurrency(api_for_convert);
    console.log(get_currency_layer_result);
    converted_amt = get_currency_layer_result.result
    console.log('converted value is >>>>>>>>>>==== '+converted_amt);
  })()
  */
}
const fetchGetMethod_forCurrency = async (apiFunction) => {
  var apiUrl = apiFunction;
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data;
}

const sleep = (milliseconds=500) => new Promise(resolve => setTimeout(resolve, milliseconds))

const getDomainModules = async (domain) => {
  let module_list_arr = [];
  var modules = await fetchGetMethod('module_list?sel_domain=' + domain);
  let module_name = modules.module_list_main.module_name;
  let module_slug = modules.module_list_main.module_slug;
  let module_icon = modules.module_list_main.module_icon;
  for (let j in module_name) {
    module_list_arr.push({
      'module': module_name[j],
      'slug': module_slug[j],
      'icon': module_icon[j],
    });
  }
  // console.log(module_list_arr);
  var result = {
    module_list: module_list_arr,
  }

  return result;
}

const getModularFeatures_old = async(domain, module_slug) => {
  console.log('domain --->> '+domain);
  console.log('module slug --->> '+module_slug);
  let feature_list_basic_arr = [];
  let feature_list_advance_arr = [];
  let modular_features = await fetchGetMethod('modular_features?sel_domain=' + domain+'&module_slug='+module_slug+'');
  // console.log(modular_features);
  let list_basic = modular_features.feature_list_basic;
  let list_advance = modular_features.feature_list_advance;

  let name_basic = list_basic.feature_name;
  let unit_basic = list_basic.feature_unit;
  let factor_basic = list_basic.feature_wt_factor;



  let name_advance = list_advance.feature_name;
  let unit_advance = list_advance.feature_unit;
  let factor_advance = list_advance.feature_wt_factor;
  
  let str_only = '';

  for (let j in name_basic) { // prepare basic list
    // console.log(factor_basic[j]);
    str_only = name_basic[j].replace(/[^a-zA-Z ]/g, "");
    feature_list_basic_arr.push({
      'feature': name_basic[j],
      'feature_key': (str_only.replace(/ /g, "-")).toLowerCase(),
      'feature_unit': unit_basic[j],
      'feature_wt_factor': factor_basic[j],
    });
  }

  console.log(feature_list_basic_arr);

  for (let k in name_advance) {   // prepare advance list
    str_only = name_advance[k].replace(/[^a-zA-Z ]/g, "");
    feature_list_advance_arr.push({
      'feature': name_advance[k],
      'feature_key': (str_only.replace(/ /g, "-")).toLowerCase(),
      'feature_unit': unit_advance[k],
      'feature_wt_factor': factor_advance[k],
    });
  }

  var result = {
    basic_list: feature_list_basic_arr,
    advance_list: feature_list_advance_arr
  }

  return result;
}

const getModularFeatures = async (domain) => {

  console.log('domain is ' + domain);
  let modular_features_arr = await fetchGetMethod('modular_features?sel_domain=' + domain + '');
  let module_arr_raw = modular_features_arr.modular_feature;
  let module_arr = Object.keys(module_arr_raw);
  console.log(module_arr);

  var modular_list = {};
  // START LOOPING
  for (const module_title of module_arr) {
    var result = {};
    // console.log('module is ------------------->'+module_title);
    let str = toString(module_title);
    let feature_list_basic_arr = [];
    let feature_list_advance_arr = [];

    let list_basic = [];
    let list_advance = [];

    let name_basic = [];
    let unit_basic = [];
    let factor_basic = [];

    let name_advance = [];
    let unit_advance = [];
    let factor_advance = [];

    let str_only = '';
    // console.log(modular_features_arr.modular_feature[module_title].hasOwnProperty("basic_list")); 
    // handle if basic list or advance list not available
    if(modular_features_arr.modular_feature[module_title].hasOwnProperty("basic_list") == true){
      list_basic = modular_features_arr.modular_feature[module_title].basic_list;
      name_basic = list_basic.features;
      unit_basic = list_basic.unit;
      factor_basic = list_basic.wt_factor;
      for (let j in name_basic) { // prepare basic list
        // console.log(factor_basic[j]);
        str_only = name_basic[j].replace(/[^a-zA-Z ]/g, "");
        feature_list_basic_arr.push({
          'feature': name_basic[j],
          'feature_key': (str_only.replace(/ /g, "-")).toLowerCase(),
          'feature_unit': unit_basic[j],
          'feature_wt_factor': factor_basic[j],
        });
      }
      result['basic_list'] = feature_list_basic_arr
    } else{
      // list_basic = modular_features_arr.modular_feature[module_title].basic_list = [];
      result['basic_list'] = []
    }

    if(modular_features_arr.modular_feature[module_title].hasOwnProperty("advance_list") == true){
      list_advance = modular_features_arr.modular_feature[module_title].advance_list;
      name_advance = list_advance.features;
      unit_advance = list_advance.unit;
      factor_advance = list_advance.wt_factor;

      for (let k in name_advance) {   // prepare advance list
        str_only = name_advance[k].replace(/[^a-zA-Z ]/g, "");
        feature_list_advance_arr.push({
          'feature': name_advance[k],
          'feature_key': (str_only.replace(/ /g, "-")).toLowerCase(),
          'feature_unit': unit_advance[k],
          'feature_wt_factor': factor_advance[k],
        });
      }
      result['advance_list'] = feature_list_advance_arr
    } else{
      result['advance_list'] = []
    }
    modular_list[module_title] = result
  }
  // END LOOPING
  return modular_list;
}

/*cronjob.schedule('55 * * * * *', function() {
  var attachment_sent = 0;
  var data_pdf_path = '';
  var uid = 0;
  const SENDGRID_APY_KEY = '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';
  sgMail.setApiKey(SENDGRID_APY_KEY);
  
  console.log('running a task to send email v1 --------------');
  (async () => {
    console.log("function invoked...")
    await sleep(2000);
    console.log("function invoked after sleep()...");
    var qry_select = 'SELECT * FROM `app_cost_calculator` LEFT JOIN users on app_cost_calculator.user_id = users.user_id WHERE app_cost_calculator.attachment_sent = ?';
    var input_params = [ attachment_sent ];  
    var get_result = await db.dbQuery(qry_select, input_params);
    console.log(get_result.length);    // all ok
    // send user id to create pdfs
    // get_result.forEach(user => {
    //   uid = user.user_id;
    //   console.log(user.user_name+'---------------'+user.user_id);
    //   // data_pdf_path = await fetchGetMethod('save_pdf?user_id=' + uid);
    //   // console.log(data_pdf_path); 
    // });
    for (const user of get_result) {
      attachment_sent = 1;
      console.log(user.user_name+'---------------'+user.user_id);
      uid = user.user_id;
      data_pdf_path = await fetchGetMethod('save_pdf?user_id=' + uid);
      console.log(data_pdf_path); 
      // get pdf path and add it as an attachment in mail with thank you
      request(data_pdf_path, { encoding: null }, (err, res, body) => {
        if (err) { return err; }
        if (body) {
          const textBuffered = Buffer.from(body);
          const msg = {
            to: user.email, // Change to your recipient
            from: 'info@redbytes.in',
            subject: 'Redbytes UK',
            text: 'Mobile App Cost Estimation',
            html: 'Dear '+user.user_name+',<br><strong>Thank you for getting in touch! </strong><br>We have received your message and would like to thank you for writing to us. One of our sales person will get back in touch with you soon! <br><br>Have a great day!',
            attachments: [
              {
                content: textBuffered.toString('base64'),
                filename: 'attachment.pdf',
                type: 'application/pdf',
                disposition: 'attachment',
                content_id: 'mytext',
              },
            ],
          };
          // send msg here
          sgMail
          .send(msg)
          .then((response) => {
            console.log("success");
          })
          .catch((error) => {
            console.log("error");
          })
        }
      });
      // update attachment_sent status to 0
      var qry_update = 'UPDATE app_cost_calculator SET attachment_sent = ? WHERE user_id = ?';
      var input_params_set = [ attachment_sent, uid ];  
      var update_result = await db.dbQuery(qry_update, input_params_set);
      console.log(update_result);
    }

  })()
});*/

module.exports = {
  getDomainList,
  getAllplatforms,
  getDomainFeatures,
  getNonFunctionalFeatures,
  getAdminFeature,
  getOtherApps,
  findAppCost,
  findAppCostFull,
  saveContactUser,
  getAllCostEstimation,
  getCostReductionDetails,
  saveLead,
  getContactMeOptions,
  getDomainModules,
  getModularFeatures,
  getAllCostEstimationCX,
  getCostReductionDetailsCX,
  html_to_pdf,
  getNonFunctionalFeaturesWithEstimation,
  findAppEstimationFirst
}