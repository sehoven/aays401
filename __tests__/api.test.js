//Dependencies
const fs = require('fs');
var request = require('request');
const Client = require('pg');
require('dotenv').load();
const connectionString = 'postgresql://'+process.env.databaseUser+':'+process.env.databasePassword+'@localhost:'+process.env.databasePort+'/'+process.env.databaseName+''



describe('Main Page Testing', function() {
    //Check status of main page
    it('Main page status is 200', function(done) {
    
        request('http://localhost:8080' , function(error, response, body) {
            expect(response.statusCode).toBe(200);
            done();
        });
    });
});


describe('Search Testing', function() {
    
    //Search call should return status of 200
    it('Main page search returns 200',function(done) {

        var term = "RUTHERFORD";   
        request(` http://localhost:3000/locations?name=${term}`,function(error,response,body){
            expect(response.statusCode).toBe(200);
            expect(body).not.toBe({});
            done();
        }); 
    });


    //Search should return data for this test
    it('Main page search returns correct data according to search term',function(done) {
    
        var term = "RUTHERFORD";
        request(` http://localhost:3000/locations?name=${term}`,function(error,response,body){
            
            var obj = JSON.parse(body);
            expect(obj[0].name).toBe(term);
            done();
        });
    });


    //Search should return nothing for this test
    it('Main page search returns nothing based on search term',function(done) {
    
        var term = "lkhfgjkhsafjahsd";
        request(` http://localhost:3000/locations?name=${term}`,function(error,response,body){
            var obj = JSON.parse(body);
            expect(obj).toBeNull;
            done();
        });
    });

});


describe('Polygon Count Testing', function() {
        

        //Poly count should return status of 200 along with data
        it('Poly count should return status of 200 along with data',function(done) {
        
            
            const client1 = new Client.Client({
                connectionString: connectionString,
                })
            client1.connect()
            .catch(e => console.error('Connection Error', e.stack))
        
            //Getting random poly for testing
            var queryText = 'SELECT latitude,longitude from aays.tblNeighbourhood Limit 1;';
            client1.query(queryText,function(err,result) {
                client1.end(); // closing the connection;
                if(err){
                    console.log(err);
                }

                let latLngs = [];
               
                // Converting to format requested by API
                for(let j = 0; j < result.rows[0].latitude.length; ++j) {
                  
                  latLngs.push({
                    lat: result.rows[0].latitude[j],
                    lng: result.rows[0].longitude[j]
                  });
                }


                
                let body = JSON.stringify({ "poly" : latLngs});
                
                request( ` http://localhost:3000/addressCount` ,
                        { "method": 'POST',
                        "body": body,
                        "headers": {  'Content-Type': 'application/json',
                        'Content-Length': new Buffer(body).length }},function(error,response,body){
        
                expect(response.statusCode).toBe(200);
                expect(body).not.toBe({});
                
                //To print unit counts of neighbourhood
                //console.log("\n");
                //console.log(neighborhoods.name+"\n");
                //console.log(body);
                done();
            });
      
        });
    
    });

});

