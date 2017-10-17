
//Dependencies
const fs = require('fs');
var request = require('request');

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
    //Poly count should return status of 400
    it('Poly count should return status of 400',function(done) {
    

        //Variables for testing
        var neighborhoods = fs.readFileSync('./data/neighborhoods.json', 'utf8');
        neighborhoods = JSON.parse(neighborhoods).neighborhoods[0];

        let body = JSON.stringify({ "poly" : neighborhoods.points});
        request( ` http://localhost:3000/addressCount` ,
                { "method": 'POST',
                "body": body,
                "headers": {  'Content-Type': 'application/json',
                'Content-Length': new Buffer(body).length }},function(error,response,body){

            expect(response.statusCode).toBe(400);
            done();
        });
    });


    //Poly count should return status of 200 along with data
    it('Poly count should return status of 200 along with data',function(done) {
    
        //Variables for testing
        var neighborhoods = fs.readFileSync('./data/neighborhoods.json', 'utf8');
        neighborhoods = JSON.parse(neighborhoods).neighborhoods[5];
        var center = 53.5727667926;
        var radius = 1;

        let body = JSON.stringify({ "poly" : neighborhoods.points,"center":center,"radius":radius});
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

