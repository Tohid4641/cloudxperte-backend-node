const mysql = require('mysql'); 
const util = require('util');
const configModel = require('./model/configModel').data;
const dbPARAMS = {
    host : configModel.DB_HOST,
    user : configModel.DB_USER,
    password : configModel.DB_PASSWORD,
    database : configModel.DB_NAME,
    timeout: 60000
}
const conn = mysql.createConnection(dbPARAMS);

conn.connect();

const dbQuery = async (sqlquery, params) =>{
    try {
        const query = util.promisify(conn.query).bind(conn);
        const rows = await query(sqlquery, params);
        return rows;
      } finally {
        //conn.end();
      }
}


module.exports = {
    dbQuery
}