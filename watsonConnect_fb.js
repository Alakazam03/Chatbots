

const express = require('express');
const bodyParser = require('body-parser');
const request =require('request');
const ConversationV1 = require('watson-developer-cloud/conversation/v1');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


var contexts = [];

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode',server.address().port, app.settings.env);

});

app.get('/', (request, res) => {
  console.log('checking');
  if (request.query['hub.mode'] === 'subscribe' && request.query['hub.verify_token'] === 'tuxedo_cat') {
    console.log("Validating webhook");
    res.status(200).send(request.query['hub.challenge']);
  } else {
    console.error("failed");
    res.status(403).end();
  }
});


app.post('/', (request,res) =>{
  console.log("post function");
  console.log(request.body);
  if(request.body.object === 'page') {
    
    request.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) =>{
        if (event.message && event.message.text){
         // console.log("inside post loop____");
          console.log(event.message.text);
          getWatson(event);
          
        }
      });
    });
    res.status(200).end();
  }
});


function getWatson(event){
  var number = event.sender.id;
 // console.log("inside watson")
  var message = event.message.text;
  
 
  var context = null;
  var index = 0;
  var contextIndex = 0;
  contexts.forEach(function(value) {
    console.log(value.from);
    if (value.from == number) {
      context = value.context;
      contextIndex = index;
    }
    index = index + 1;
  });

  console.log('Recieved message from ' + number + ' saying \'' + message  + '\'');

  var conversation = new ConversationV1({
    username: '48c3f747-294d-4db4-8602-70dad10b4233',
    password: 'FGxkTZmQjLoG',
    version_date: ConversationV1.VERSION_DATE_2017_04_21
  });

  console.log(JSON.stringify(context));
  console.log(contexts.length);

  

  conversation.message({
    input: { text: message },
    workspace_id: '8b949fe3-319c-4414-a956-f839cf8f4fa3',
    context: context
   }, function(err, response) {
       if (err) {
         console.error(err);
       } else if(response.output.text[0]!=null){
         console.log("i am ahere");
         console.log(response.output.text[0]);
         console.log("i am aherefef");
         if (context == null) {
           contexts.push({'from': number, 'context': response.context});
         } else {
           contexts[contextIndex].context = response.context;
         }
         if(response.intents[0]!=null){
         var intent = response.intents[0].intent;
         console.log("inyentbcbidc");
         console.log(intent);
       }
       else{
        console.log("behehe");
        var intent="random";}
         //if (intent == "done") {	
           //contexts.splice(contexts.indexOf({'from': number, 'context': response.context}),1);
           //contexts.splice(contextIndex,1);
           // Call REST API here (order pizza, etc.)
         //}

         request({
          url: 'https://graph.facebook.com/v2.6/me/messages',
          qs: {access_token: 'EAAaNKwUdZAj8BAOA5mcrZBo2HbTVZCZAjZBwunEf8lWdMU2dn2ZB9BW8fFDnZCRhnIbwOUZCKdR8VA0YlpR3C02196tuOVAz4mFqPqJZBbhIyjTyrfKJXRw9bMOZBaWXSp7dkbqgyINAMWFZAzsQPgwP1be1mfcuX6M6DxEmsovVAryeQZDZD'},
          method: 'POST',
          json: {
            recipient: {id: number},
            message: {text: response.output.text[0]}
          }
        },function(error,response){
          if(error) {
            console.log("Error sending message: ",error);
          } else if (response.body.error){
            console.log('Error: ',response.body.error);
          }
        });
         }
         else{
          response.output.text[0]="teri maa ki chut";
         }
       });
     }


   
