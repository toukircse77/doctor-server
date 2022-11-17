const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//midleware 
app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p9ygaby.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const appoinmentOptionCollection = client.db("doctorPortal").collection("appoinmentOptions");
        const bookingsCollection = client.db("doctorPortal").collection("bookings");
        const usersCollection = client.db("doctorPortal").collection("users");

        app.get('/appoinmentOptions', async (req, res) =>{
            const date = req.query.date
            const query = {};
            const options = await appoinmentOptionCollection.find(query).toArray()
            const bookingQuery = {appoinmentDate: date}
            const allreadyBooked = await bookingsCollection.find(bookingQuery).toArray();
            //code carefully
            options.forEach(option =>{
                const optionBooked = allreadyBooked.filter(book => book.treatment === option.name )
                const bookedSlots = optionBooked.map(book => book.slot)
                const remainingSlots = option.slots.filter(slot => !bookedSlots.includes(slot))
                option.slots = remainingSlots;
                
            })
            res.send(options)
        })

        // API Naming convention
        //app.get('/bookings')
        //app.get('/bookings/:id')
        //app.post('/bookings')
        //app.put('/bookings/:id')
        //app.delete('/bookings/:id')

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email};
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings)
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking)
            const query = {
                appoinmentDate: booking.appoinmentDate,
                email: booking.email,
                treatment: booking.treatment
                
            }
            const alreadyBooked = await bookingsCollection.find(query).toArray();
            if(alreadyBooked.length){
                const message = `you already have a booking on ${booking.appoinmentDate}`
                return res.send({acknowledged: false, message })
            }
            const result = await bookingsCollection.insertOne(booking);
            res.send(result)
        });
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user)
            const result = await usersCollection.insertOne(user);
            console.log(result)
            res.send(result);
        })
    }

    finally{

    }
}
run().catch(err => console.error(err))






app.get('/', async (req, res) => {
    res.send("doctors portal server is running")
})


app.listen(port, () => console.log(`doctors portal is running ${port}`));