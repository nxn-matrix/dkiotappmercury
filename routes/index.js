var express = require('express');
var path = require('path');
var https = require('https');
var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();
var iotf = require('ibmiotf');
var response_received = "false";

var appConfig;
var my_org;
var responseString;

var serverPort = process.env.PORT || 8000;

function accessPi(cmd,req,res) {

if (process.env.VCAP_SERVICES) {
    var env = JSON.parse(process.env.VCAP_SERVICES);
    my_org = env["iotf-service"][0].credentials.org;
    my_auth_key = env["iotf-service"][0].credentials.apiKey;
    my_auth_token = env["iotf-service"][0].credentials.apiToken;
    appConfig = {
                   'org' : env["iotf-service"][0].credentials.org,
                   'id' : 'dkiotappmercury',
                   'auth-key' : env["iotf-service"][0].credentials.apiKey,
                   'auth-token' : env["iotf-service"][0].credentials.apiToken
                  }
} else {
    //appConfig = require('./application.json');
    appConfig = {
                   'org' : 'pm85g2',
                   'id' : 'dkiotappmercury',
                   'auth-key' : 'a-pm85g2-mvae3jwsvv',
                   'auth-token' : 'Th*tM*KlDDnB1q@Ixe'
                  }

}

var appClient = new iotf.IotfApplication(appConfig);
console.log('appClient is configured')


//var server = app.listen(serverPort, function(cmd) {
    //var port = server.address().port;
    console.log('Listening on port : %s', serverPort);
    appClient.connect();
    console.log('appClient is connected')

    appClient.on('connect', function() {
        var myData = {};
        appClient.subscribeToDeviceEvents();
        appClient.publishDeviceCommand("rasp2monitor","euro001",cmd,"json", myData);
    });

    appClient.on('deviceEvent', function(deviceType, deviceId, eventType, format, payload) {
        //responseString =  'Device Event at ' + new Date().toString() + ' : deviceType= ' + deviceType + ' deviceId= ' +
        //                  deviceId + ' eventType= ' + eventType + ' format= ' + format + ' payload= ' + payload +
        //                  ' LED Status = ' + JSON.parse(payload).ledStatus;
        responseString =  ' Reponse status from Device at ' + new Date().toString() + ' : deviceType= ' + deviceType + ' deviceId= ' +
                          deviceId + ' LED Status = ' + JSON.parse(payload).ledStatus;
        console.log('device response = ' + responseString);
        response_received = "true";
        sendResponse(req,res);
    });

//});
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
