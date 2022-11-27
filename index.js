const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken')
const app = express()
const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@grover-grocery.gqn8qjj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function verifyJWT(req,res,next){
    const authHeader =  req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token,process.env.JWT_TOKEN,(err,decoded)=>{
        if(err){
            return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded
        next()
    })
}
async function  run() {
    try{
        const productCollection = client.db('SecondTimeBuy').collection('Products')
        const usersCollection = client.db('SecondTimeBuy').collection('users')
        const bookingCollection = client.db('SecondTimeBuy').collection('booking')
        //all products
        app.get('/products',async(req,res)=>{
            const query = {};
            const products = await productCollection.find(query).toArray()
            res.send(products)
        })
        //products report
        app.put('/reportedproduct/:id',async(req,res)=>{
            const id= req.params.id
            const query = {_id : ObjectId(id)}
            const options = { upsert: true };
            const updateDoc = {
                $set:{
                    report: 'report'
                }
            }
            const result = await productCollection.updateOne(query,updateDoc,options)
            res.send(result)
        })
        //products report
        app.get('/reportedproduct',async(req,res)=>{
            const email = req.query.email;
            const query = {email : email}
            const user = await usersCollection.findOne(query);
            if(user.user.role === 'admin'){
                const allQuery = {report: 'report'}
                const reportedItems = await productCollection.find(allQuery).toArray()
                res.send(reportedItems)
            }
            else{
                res.status(401).send({massage: 'unAuthorized access'})
            }
        })
        //post products
        app.post('/products',async(req,res)=>{
            const product = req.body;
            const result = await productCollection.insertOne(product)
            res.send(result)
        })
        // id load product
        app.get('/products/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)};
            const product = await productCollection.findOne(query)
            res.send(product)
        })
        //electric bikes
        app.get('/electirc-bikes',async(req,res)=>{
            const query = {'categoryname' : 'Electirc Bikes'};
            const electircBike = await productCollection.find(query).toArray()
            res.send(electircBike)
        })
        //microbus
        app.get('/microbus',async(req,res)=>{
            const query = {'categoryname' : 'Microbus'};
            const microbus = await productCollection.find(query).toArray()
            res.send(microbus)
        })
        //Luxury Car
        app.get('/luxury-car',async(req,res)=>{
            const query = {'categoryname' : 'Luxury Car'};
            const luxuryCar = await productCollection.find(query).toArray()
            res.send(luxuryCar)
        })
        //user
        app.put('/users',async (req,res)=>{
            const user = req.body;
            const email= req.query.email;
            const query = {email : email}
            const options = { upsert: true };
           if( Object.keys(user).length === 0 ){
            const updateDoc = {
                $set:{
                    
                }
            }
            const result = await usersCollection.updateOne(query,updateDoc,options)
            const find = await usersCollection.findOne(query);
            if(find){
                const token = jwt.sign({email}, process.env.JWT_TOKEN,  { expiresIn: '1d'})
                result.token = token;
                res.send(result)
            }
        }
        else{
            const updateDoc = {
                $set:{
                    user
                }
            }
                const result = await usersCollection.updateOne(query, updateDoc, options)
                const find = await usersCollection.findOne(query);
                if(find){
                    const token = jwt.sign({email}, process.env.JWT_TOKEN,  { expiresIn: '1d'})
                    result.token = token;
                    res.send(result)
                }
        }
        })
        //user collection
        app.get('/users',async(req,res)=>{
            const email = req.query.email;
            const query = {email : email}
            const allQuery = {}
            const user = await usersCollection.findOne(query);
            if(user.user.role === 'admin'){
                const result = await usersCollection.find(allQuery).toArray();
                res.send(result)
            }
        })
        //user role
        app.get('/userrole',verifyJWT,async (req,res)=>{
            const email = req.query.email;
            const query = {email : email}
            if(email !== decodedEmail){
                return res.status(403).send({message : 'forbidden access'})
            }
            const user = await usersCollection.findOne(query);
            const role = {role:user?.user?.role}
            res.send(role)
        })
        //seller
        app.get('/sellers',async (req,res)=>{
            const email = req.query.email;
            const query = {email : email}
            const user = await usersCollection.findOne(query);
            if(user.user.role === 'admin'){
                const allQuery = {'user.role' : 'seller'}
                const seller = await usersCollection.find(allQuery).toArray()
                console.log(seller)
                res.send(seller)
            }
            else{
                res.status(401).send({massage: 'unAuthorized access'})
            }
        })
        //seller verify
        app.put('/sellers/:id',async (req,res)=>{
                const id= req.params.id
                console.log(id)
                const query = {_id : ObjectId(id)}
                const options = { upsert: true };
                const updateDoc = {
                    $set:{
                        'user.verified': true
                    }
                }
                const result = await usersCollection.updateOne(query,updateDoc,options)
                res.send(result)
        })
        //seller verify
        app.get('/sellerVerify',async (req,res)=>{
            const email = req.query.email;
            const query = {email : email}
            const user = await usersCollection.findOne(query);
            console.log(user)
            res.send(user)
        })
        //user delete
        app.delete('/user/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)}
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })
        //post booking
        app.post('/booking',async (req,res)=>{
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking)
            res.send(result)
        })
        // advertise
        app.put('/advertise/:id',async (req,res)=>{
            const id= req.params.id
            const query = {_id : ObjectId(id)}
            const options = { upsert: true };
            const updateDoc = {
                $set:{
                    avt: true
                }
            }
            const result = await productCollection.updateOne(query,updateDoc,options)
            res.send(result)
        })
        // advertise
        app.get('/advertise',async (req,res)=>{
            const query = {avt : true}
            const result = await productCollection.find(query).toArray()
            res.send(result)
        })
        //user booking
        app.get('/booking',verifyJWT, async(req,res)=>{
            const email = req.query.email;
            const query = {email : email}
            const user = await usersCollection.findOne(query);
            if(email !== decodedEmail){
                return res.status(403).send({message : 'forbidden access'})
            }
            if(user.user.role){
                const result = await bookingCollection.find(query).toArray();
                const role = {role:user.user.role}
                res.send({result,role})
            }
        })
        // My Product
        app.get('/myproducts',verifyJWT,async (req,res)=>{
            const email = req.query.email;
            const query = {email : email}
            if(email !== decodedEmail){
                return res.status(403).send({message : 'forbidden access'})
            }
            const result = await productCollection.find(query).toArray();
            res.send(result)
        })
        // My Product delete
        app.delete('/myproduct/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)}
            const result = await productCollection.deleteOne(query)
            res.send(result)
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