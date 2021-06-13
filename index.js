const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const port = 5000
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r8riy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const password = "arabianhorse79"

const app = express()
app.use(cors())
app.use(bodyParser.json());


var admin = require("firebase-admin");

var serviceAccount = require("./burj-al-arab-1111-firebase-adminsdk-iufb0-fe5dcaf422.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");

  app.post('/addBooking' , (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
    .then(result => {
        res.send(result.insertedCount > 0 );
    })
    console.log(newBooking);
  })

     app.get('/bookings', (req, res) => {
       const bearer = req.headers.authorization;
         if(bearer && bearer.startsWith('Bearer')){
           const idToken = bearer.split(' ')[1];
           console.log({idToken});
           admin
         .auth()
         .verifyIdToken(idToken)
         .then((decodedToken) => {
           const tokenEmail = decodedToken.email;
           if(tokenEmail == req.query.email){
            bookings.find({email: req.query.email})
            .toArray((err, documents) => {
               res.status(200).send(documents)
           })
           }})
         .catch((error) => {
          res.status(401).send('unauthorized access')
         });
         }
        else{
          res.status(401).send('unauthorized access')
        }
    }) 
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port);