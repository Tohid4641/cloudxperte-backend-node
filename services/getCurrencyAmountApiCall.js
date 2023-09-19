const request = require("request");

exports.fixerRateConvertionApiCall = async (currency_to, base_amount_to_convert) => {
    var FIXER_ACCESS_KEY = 'rwFiRGcAzypheLnJkeGtc7Eg1GEKEQpg';
    var currency_from = 'USD';
    var options = {
      method: "GET",
      url: `https://api.apilayer.com/fixer/convert?apikey=${FIXER_ACCESS_KEY}&from=${currency_from}&to=${currency_to}&amount=${base_amount_to_convert}`,
    };
  
  //   console.log("process.env.FIXER_ACCESS_KEY",process.env.FIXER_ACCESS_KEY);
  
  
    return new Promise((resolve, reject) => {
      request(options, function (error, response) {
        if (error) {
          reject(error);
        }else{
            console.log("JSON.parse(response.body)",JSON.parse(response.body));
            let res = JSON.parse(response.body)
            console.log("res",res);
          if(res.success == true){
            // console.log("if 11");
            resolve(res)
          }else{
            // console.log("else 11");
            resolve({
              "success": false,
              "query": {
                  "from": "USD",
                  "to": "USD",
                  "amount": base_amount_to_convert
              },
              "info": {
                  "timestamp": Math.round(Date.now() / 1000),
                  "rate": 1
              },
              "date": new Date(),
              "result": base_amount_to_convert
            })
          }
        }
      });
    });
  };

// const getConversionDetails = async (currency_to, base_amount_to_convert, callback) => {

//     // console.log(`target currency is ${currency_to}`);
//     // console.log(`amount is ${base_amount_to_convert}`);

//     var converted_amt_res = {};
//     var API_ACCESS_KEY = 'rwFiRGcAzypheLnJkeGtc7Eg1GEKEQpg';
//     var currency_from = 'USD';
//     let converted_amt = 0;
//     let currency_rate = 0;
//     var options = {
//         'method': 'GET',
//         'url': `https://api.apilayer.com/fixer/convert?apikey=${API_ACCESS_KEY}&from=${currency_from}&to=${currency_to}&amount=${base_amount_to_convert}`
//       };

//     request(options,function(err, response){

//         if(err){
//             callback(null,err)
//         }
        
//         if(response.success == true){
//             converted_amt = response.result
//             callback({
//                 converted_amt:converted_amt,
//                 currency_rate:response.info.rate,
//             })
    
//             // converted_amt_res
//         } else{
//             callback({
//                 converted_amt:base_amount_to_convert,
//                 currency_rate:1,
//             })
//             // converted_amt_res
//         }

//     })
// }
    

//   module.exports = getConversionDetails;
  