/*
This script will create a database
or restore it depending on whether or not it exists.
The database config info should be stored in a .env file.

You will need to fill in the password for the "postgres" user you created
in the .env file
*/

const pg = require('pg');
const fs = require('fs');
const sleep = require('system-sleep');

var sql = fs.readFileSync('database/aaysDB.sql','ASCII').toString();


require('dotenv').load();
var dbName = process.env.databaseName;
const connectionStringPost = 'postgresql://'+process.env.databaseUser+':'+process.env.databasePassword+'@localhost:'+process.env.databasePort+'/'+process.env.databaseName+''
const connectionStringPre = 'postgresql://'+process.env.databaseUser+':'+process.env.databasePassword+'@localhost:'+process.env.databasePort+'/postgres'

//Database does exist
//Drop and recreate



const client = new pg.Client({
  connectionString: connectionStringPre,
})

  client.connect()
  .then(() => console.log('Connected To PostgreSQL'))
  .catch(e => console.error('Connection Error', e.stack))

  client.query('Create Database "'+dbName+'";',function(err,result) {

    if(err){
      client.end();
      restore();
    }

    //Wait to see if the process exists.
    //If the process exists the restore was successful
    sleep(60*1000);

    console.log('Created Database"'+dbName+'"');

    const clientNew = new pg.Client({
      connectionString: connectionStringPost,
    })
    clientNew.connect()
      .then(() => console.log('Connected To PostgreSQL'))
      .catch(e => console.error('Connection Error', e.stack))

    clientNew.query(sql,function(err,result) {

      if(err){
        client.end()
        clientNew.end()
      }
      console.log('Restored Database "'+dbName+'"');
      client.end();
      clientNew.end();
    });
});



function restore(){
  const clientNew = new pg.Client({
    connectionString: connectionStringPost,
  })
  clientNew.connect();
  console.log("Restoring Database: "+process.env.databaseName);

  clientNew.query('DROP SCHEMA "'+dbName+'"CASCADE;',function(err,result) {
    if(err){
      console.log('Could not drop database schema',err);
    }
    clientNew.query(sql,function(err,result) {

      if(err){
        console.log('SQL error\n');
        console.log(err)
        clientNew.end()
      }
      console.log('Restored Database "'+dbName+'"');
      process.exit(1);
    });
  });
}
