var app = angular.module('dkiotappmercury',[]);
app.controller('myController', function($scope, $http) {
    $scope.data = [];
    $scope.ledControl = "";
    $scope.ledControlPrev = "";
    $scope.response = "";
    $scope.clientTimeStamp = "";
    $scope.cmdType = "";
    $scope.serverTimeStamp = 0;
    $scope.stock = "";
    $scope.ledControlOn = function() {
      $scope.ledControl = ($scope.ledControlPrev == "" || $scope.ledControlPrev == "ON") ? "OFF" : "ON";
      $scope.ledControlPrev = $scope.ledControl;
      $scope.clientTimeStamp = new Date().toString();
      $scope.cmdType = "Command signal from App sent at";
    }
    $scope.ledControlOff = function() {
      $scope.ledControl = "STATUS";
      $scope.clientTimeStamp = new Date().toString();
      $scope.cmdType = "Status request from App sent at";

    }
  var request = $http.get('/data');
  request.success(function(data) {
      $scope.data = data;
  });
  request.error(function(data){
      console.log('Error: ' + data);
  });

    $scope.sendReq = function (value) {
               if (value == 1) {
                $scope.ledControlOn();
             } else if (value == 0){
                $scope.ledControlOff();
             }
               var posting = $http({
                   method: 'POST',
                   url: '/post',
                   //headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                   headers: {'Content-Type': 'application/json'},
                   data: {"ledControl" : $scope.ledControl},
                   processData: false
               })
               posting.success(function (response) {
                   $scope.response = response;
               });
    }

});
