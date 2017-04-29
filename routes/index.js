/*--------------------------------------------------------------------------------------------------------
Author        : Dinakar Kondru
File Name     : index.js
Language      : JavaScript/NodeJs
Usage command : node app.js
Description   : When the usage command is run this code will do the following:
1. Creates an pub/sub app client with configuration obtained from IBM Bluemix VCAP_SERVICES.
2. Connects the pub/sub app client to the Cloud and when connected listens for commands from front-end.
3. Excutes the commands from front end and serves the data back to front end.
3. When ON/OFF or STATUS command from front end is received it will send the command to cloud.
4. When clouds sends data back it will route it to the front end
-----------------------------------------------------------------------------------------------------------
History:
----Version--------Updated By----------Date-------Comments-----------------------------------------------------------------------------
0.0           Dinakar         04/20/2017    Created file and added all functionality server-cloud and client-server communication
0.1           Dinakar         04/29/2017    Added comments and cleaned up code
---------------------------------------------------------------------------------------------------------------------------------------*/

//express is the NodeJs framework that is being used
var express = require('express');

//path provides utilities for working with file and directory paths
var path = require('path');

//designed to support many features of the HTTP/HTTPS protocol which have been traditionally difficult to use.
//In particular, large, possibly chunk-encoded, messages. The interface is careful to never buffer
//entire requests or responses--the user is able to stream data.
var https = require('https');
var http = require('http');

//fs provides file-system utilities such as opening and reading a file.
var fs = require('fs');

//bodyParser will populate the req.body property with the parsed body from the request.
var bodyParser = require('body-parser');

//app is the instantiation of express and any APIs that express has can be used with app handle, for example app.set();
var app = express();

//ibmiotf is a node library module that has publish/subscribe APIs which provide an abstraction to low-level MQTT APIs
//Install instructions and API documentaion is available at https://www.npmjs.com/package/ibmiotf
var iotf = require('ibmiotf');

//populated with VCAP_SERVICES environment variables
var appConfig;

//populated with response sent from the device->cloud
var responseString;

//open port for communication with cloud or localhost. For localhost port=8000
var serverPort = process.env.PORT || 8000;

//
function accessPi(cmd,req,res) {

  if (process.env.VCAP_SERVICES) {
    var env = JSON.parse(process.env.VCAP_SERVICES);
    appConfig = {
      'org' : env["iotf-service"][0].credentials.org,
      'id' : 'dkiotappmercury',
      'auth-key' : env["iotf-service"][0].credentials.apiKey,
      'auth-token' : env["iotf-service"][0].credentials.apiToken
    }
  } else {
    appConfig = {
      'org' : 'pm85g2',
      'id' : 'dkiotappmercury',
      'auth-key' : 'a-pm85g2-mvae3jwsvv',
      'auth-token' : 'Th*tM*KlDDnB1q@Ixe'
    }
  }

  var appClient = new iotf.IotfApplication(appConfig);
  console.log('appClient is configured')


  console.log('Listening on port : %s', serverPort);
  appClient.connect();
  console.log('appClient is connected')

  appClient.on('connect', function() {
    var myData = {};
    appClient.subscribeToDeviceEvents();
    appClient.publishDeviceCommand("rasp2monitor","euro001",cmd,"json", myData);
  });

  appClient.on('deviceEvent', function(deviceType, deviceId, eventType, format, payload) {
    responseString =  ' Reponse status from Device at ' + new Date().toString() + ' : deviceType= ' + deviceType + ' deviceId= ' +
    deviceId + ' LED Status = ' + JSON.parse(payload).ledStatus;
    console.log('device response = ' + responseString);
    sendResponse(req,res);
  });
}

function sendResponse(req,res) {
  res.end(JSON.stringify(responseString));
}

app.set('port', serverPort);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.static('public'));
//JS client side files has to be placed under a folder by name 'public'
app.use(bodyParser.json());
//to access the posted data from client using request body
app.post('/post', function (req, res) {

  // Handling the AngularJS post request
  res.setHeader('Content-Type', 'application/json');
  console.log('Client led command = ' + req.body.ledControl);
  if (req.body.ledControl == "ON" || req.body.ledControl == "OFF") {
    accessPi("ON",req,res);
  } else if (req.body.ledControl == "STATUS") {
    accessPi("STATUS",req,res);
  }
});

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/data', function(req,res){
  res.json(responseString);
});

http.createServer(app).listen(serverPort, function () {
  console.log("Express server listening on port: " +  serverPort);
})

module.exports = app;
