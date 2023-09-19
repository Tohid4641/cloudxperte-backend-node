var express = require('express');
var router = express.Router();
var apiController = require('../controller/apiController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express 123' });
});

// api for getting domain list for step 1
router.get('/domain-list',apiController.domainList)
// api for getting platforms list for step 2
router.get('/get-platforms',apiController.getPlatForms)
// api for getting feature list for step 3
router.get('/get-features/:domain',apiController.getFeatures)
// api for feature list (NON-FUNCTIONAL FEATURES) for step 4
router.get('/get-non-functional-features',apiController.getNonFunctionalFeatures)
// api for admin panel feature list for step 5
router.get('/get-adminpanel-features/:domain',apiController.getAdminFeatures)
// api for other apps for step 6
router.get('/get-other-apps/:domain',apiController.getOtherApps)
//api for get app/project cost
router.post('/get-app-cost',apiController.getAppCost)
//api for save contact details and give response full details
router.post('/save-contact-info',apiController.saveContactInfo)

//api for screen reduction cost and hours 
router.post('/cost-reduce',apiController.costReduce)

//api for getting final reduced cost
router.post('/get-final-cost-reduced',apiController.getReducedCost)

//api for sending email (user + admin)
router.post('/send-emails',apiController.sendEmailsOnSubmission)

//api for saving lead in CRM
router.post('/save-lead',apiController.saveLeadInCRM)

//api for sending contactme options
router.get('/contact-me-options',apiController.contactMeOptions)

// APIs FOR CLOUDXPERTE
//api for getting module list for cloudxperte
router.get('/get-modules/:domain',apiController.getModules)

//api for getting modular feature list for cloudxperte
// router.get('/get-modular-features/:domain/:module_slug',apiController.getModularFeatureList)

//api for getting modular feature list for cloudxperte
router.get('/get-modular-features/:domain/',apiController.getModularFeatureList)

//api for first level estimation
router.post('/get-first-level-estimation/',apiController.getFirstEstimation)

//api for reduced cost accept button
router.post('/accept-reduced-cost-mail', apiController.sendAcceptButtonMail)

module.exports = router;
