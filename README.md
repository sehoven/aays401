# AaYS401

aays401 is the project repository for AaYS's flyer mapping system. This system will provide a graphical interface to facilitate division of geographical areas within the city given a total delivery zone that can be further partitioned into individual flyer routes. It will also provide additional functionality to analyze zone properties such as estimated total number of units and estimated numbers of buildings of a particular type. 

## Other Datasets
For other datasets, and to see data from other cities, please see https://dev.socrata.com
The have compiled all the datasets from the majority of cities in North America.
Download your dataset from their and integrate it with this app.

## Getting Started

After completing installation, navigate to http://localhost:8080/ to operate.

### Prerequisites

Any operating system, a Node Package Manager, and a suitable ES6 compliant web browser.

### Installing

After obtaining a copy of the codebase, initialize npm in the top directory. Run "> npm i" to install all the required dependencies. Enter "> npm run build" to build the React client. Afterwards, the server can be run with "> node server.js" and the React client can be run using "> npm run start".

## Setting up the database
* Install Postgresql on your development machine. Choose PostgreSQL 9.6
* If you are suing an Ubunto Server Use: sudo apt-get install postgresql-9.6
* After the installation, set the path to your psql command. (On mac... "export PATH=/Library/PostgreSQL/9.6/bin:$PATH")
* Make sure you create the postgresql user. Remember the username and password.
* Extract the sql.zip file in the database folder. Make sure the name stays the same. "aaysDB.sql".
* Create a .env file in the root directory of the application. Which is /aays401
* Make sure the layout is as following 
* databaseName= Name of DB Probably aays
* databasePassword= Some password
* databasePort=5432 (Defult port)
* databaseUser=postgres ( Defult user)
* Ensure the databaseName is the same as the aaysDB.sql file. Do a search in the file for "aays" and replace if needed.
* Save
* Ensure you are in the root directory for aays401. The directory where you created the .env file.
* run the command... "node database.js"
* The database should be created. Test by running the application.
* If you want a better look at the database, download pgadmin.

## Creating users
* Users can signup on the homepage
* For users to be able to login, it is necessary for the DBA to authenticate the user in the database.
* Until this occurs a user is not able to login

## Running the tests

run ">npm test" which runs jest
run ">npm test -- --watch" this will run any tests that have been changed  

## Creating Documentation Using Apidocs

* After adding some documentation using APIDOCS format. Your will need to update the /docs/apidocs folder.
* To do this go into the gulpfile.js file, and edit the paths for the files with documentation
* Then run gulp apidoc
* You should see a message like "Finished 'apidoc' after 225 ms".
* You can use APIDocs for clientside as well

## Deployment
### Initial Setup
* sudo apt-get update
* sudo apt-get upgrade
* http://www.hostingadvice.com/how-to/install-nodejs-ubuntu-14-04/ (Option 2)
* sudo apt-get install -y nodejs
* sudo apt-get install -y npm
* sudo apt-get install postgresql-9.6
* Next follow the instructions in the database setup instructions
* Make symbolic link:
* sudo ln -s /usr/bin/nodejs /usr/bin/node
### Test Setup Was Sucessful
* Test:
* node -v
* npm -v
* (Should see version number)
* If node is not most up to date version (for example, if “node -v” yields “v0.10.25”):
* sudo apt-get install curl
* (For version 8)
* curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
* sudo apt-get install -y nodejs
* Now if you test:
* node -v
* It should give you something like: 
* v8.9.0
### Git Setup
* sudo apt-get install -y git
* Generate ssh key to clone repo:
* git config --global user.email "email"
* ssh-keygen -t rsa
* eval "$(ssh-agent -s)"
* ssh-add -k <path to key>
* ssh-add -l (should print line with your key name at the end)
* Add ssh public key to github account with repo permissions
* Check connection with:
* ssh -T git@github.com
### Get The Repository
* Clone the repo onto the server:
* git clone git@github.com:Etiennera/aays401.git
* Install dependencies:
* npm install
* Might need to run sudo npm install
### Start Services
* Install PM2 (http://pm2.keymetrics.io/docs/usage/quick-start/) 
* npm install pm2@latest -g
* pm2 start server.js
* pm2 start npm -- start

TODO

## Built With

* [Node.js](https://nodejs.org/en/about/) - Back End Framework
* [React JS](https://facebook.github.io/react/) - Front End Framework

## Authors

TODO

## License

TODO after consultation

## Acknowledgments

* https://gist.github.com/PurpleBooth/109311bb0361f32d87a2
* https://data.edmonton.ca/City-Administration/Property-Information-Data/dkk9-cj3x
