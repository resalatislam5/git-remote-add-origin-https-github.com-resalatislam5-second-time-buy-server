const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@grover-grocery.gqn8qjj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function  run() {
    try{
        const productCollection = client.db('SecondTimeBuy').collection('Products')
        app.get('/products',async(req,res)=>{
            const query = {};
            const products = await productCollection.find(query).toArray()
            res.send(products)
        })
        app.get('/products/:id',async(req,res)=>{
            const id = req.params.id;
            console.log(id)
            const query = {_id : ObjectId(id)};
            const product = await productCollection.findOne(query)
            res.send(product)
        })
        app.get('/electirc-bikes',async(req,res)=>{
            const query = {'categoryname' : 'Electirc Bikes'};
            const electircBike = await productCollection.find(query).toArray()
            console.log(electircBike)
            res.send(electircBike)
        })
    }
    finally{

    }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('SecondTimeBye server running ...')
})

app.listen(port,()=>{
    console.log(`SecondTimeBye server running on ${port}`)
})