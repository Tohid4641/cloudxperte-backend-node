const request = require("request");

exports.ipstackApiCall = async (ipAddress) => {

  let IPSTACK_ACCESS_KEY = 'b9e2ec5c244e68f3af7f06a876cd5f36';
  var options = {
    method: "GET",
    url: `https://api.ipstack.com/${ipAddress}?access_key=${IPSTACK_ACCESS_KEY}`,
  };

//   console.log("process.env.IPSTACK_ACCESS_KEY",process.env.IPSTACK_ACCESS_KEY);


  return new Promise((resolve, reject) => {
    request(options, function (error, response) {
      if (error) {
        reject(error);
      }else{
        let res = JSON.parse(response.body)

        if(res.success == false){
          resolve({
              currency : {
                code : 'USD',
              },
              city_name : 'Not Available',
              flag_code : 'Not Available',
              flag_url : '',
              country_name : 'Not Available',
            });
        }else{
          resolve(res)
        }
      }
    });
  });
};



// const getGeoDetails = async (remote_ip,callback) => {
//     // do something asynchronously and return a promise
//     let currency_val = '';
//     // let IPAPI_ACCESS_KEY = 'b17b85c27f0ac8e619af791922cd25ec';
//     let IPSTACK_ACCESS_KEY = 'b9e2ec5c244e68f3af7f06a876cd5f36';
//     let converted_amt = 0;
//     let res_str = '';
//     let country_name = '';
//     let currency_name = '';
//     let city_name = '';
//     let flag_code = ';'
//     var options = {
//       'method': 'GET',
//       // 'url': `https://api.ipapi.com/api/${remote_ip}?access_key=${IPAPI_ACCESS_KEY}`
//       'url': `https://api.ipstack.com/${remote_ip}?access_key=${IPSTACK_ACCESS_KEY}`
//     };
//      request(options, function (error, response) {
//       if (error) {
//         callback(null,error.message)
//       }
//       res_str = JSON.parse(response.body);    // json result
//     //   console.log(res_str.success);
//       if(res_str.success == false){
//         country_name = 'Not Available';
//         currency_name = 'USD';
//         city_name = 'Not Available';
//         flag_code = 'Not Available';
//         callback({
//             country_name:country_name,
//             city_name:city_name,
//             currency_name:currency_name,
//             flag_code:flag_code
//         },null)
//       } else{ 
//         country_name = res_str.country_name;
//         currency_name = res_str.currency.code;
//         city_name = res_str.city;
//         flag_code = res_str.country_code;
//         callback({
//             country_name:country_name,
//             city_name:city_name,
//             currency_name:currency_name,
//             flag_code:flag_code
//         },null)
//       }
//     });
//     // await sleep(1000);
//     //   var output_arr = {
//     //     country_name:country_name,
//     //     city_name:city_name,
//     //     currency_name:currency_name,
//     //     flag_code:flag_code
//     //   }
//     //   return output_arr;
//   }

// module.exports = getGeoDetails