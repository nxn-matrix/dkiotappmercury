To start a brand new project from scratch (refer http://4dev.tech/2016/01/tutorial-integrating-angularjs-with-nodejs/)
------------------------------------------

>npm install express-generator -g
>express myBrandNewProject
It will create the directory structure for you.

All you change is 3 files:
edit routes/index.js -- nodeJs code
edit public/javascripts/app.js -- angularJS code
create and edit views/index.html -- HTML code

To run client-server communication app (ledControl)
>node app.js
In a browser address bar type "localhost:3000"
