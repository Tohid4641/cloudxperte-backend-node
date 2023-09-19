require('dotenv').config();
const data = {
    API_URL: process.env.APIURL,
    DB_HOST: process.env.DBHOST,
    DB_USER: process.env.DBUSER,
    DB_PASSWORD: process.env.DBPASSWORD,
    DB_NAME: process.env.DBNAME,
};
module.exports = {
    data
}