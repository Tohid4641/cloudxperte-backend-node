const hire_app_route = require('express').Router()
const { submitRequest, getResponse, whenToHireDeveloper, submitInquiryForm } = require('../controller/hire_app_controller')


hire_app_route.post('/submitRequest',submitRequest)
hire_app_route.post('/getResponse',getResponse)
hire_app_route.get('/whenToHireDeveloper',whenToHireDeveloper)
hire_app_route.post('/submitInquiryForm',submitInquiryForm)

module.exports = hire_app_route