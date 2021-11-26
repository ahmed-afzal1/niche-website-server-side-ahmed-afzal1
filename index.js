const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.38is2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db('real_estate');
    const productsCollection = database.collection('products');
    const ordersCollection = database.collection('orders');
    const reviewsCollection = database.collection('reviews');
    const usersCollection = database.collection('users');

    app.get('/products',async(req,res)=>{
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
      res.json(products);
    })

    app.post('/products',async(req,res)=>{
      const products = req.body;
      const result = await productsCollection.insertOne(products);
      res.send(result);
    })

    app.get('/products/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)}
      const result = await productsCollection.findOne(query);
      res.json(result);
    })

    app.delete('/products/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await productsCollection.deleteOne(query);
      res.json(result);
    })

    app.get('/orders',async(req,res)=>{
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
      res.json(orders);
    })

    app.post('/orders',async(req,res)=>{
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      res.send(result);
    })

    app.get('/orders/:email',async(req,res)=>{
      const query = req.params.email;
   
      const cursor = ordersCollection.find({email:query});
      const result = await cursor.toArray();
      res.send(result);
      res.json(result)
    })

    app.delete('/orders/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    })

    app.put('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
          $set: {
              status: updatedStatus.status,
          },
      };
      const result = await ordersCollection.updateOne(filter, updateDoc, options)
      res.json(result)
  })

    app.get('/reviews',async(req,res)=>{
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
      res.json(reviews);
    })

    app.get('/reviews/:email',async(req,res)=>{
      const query = req.params.email;
   
      const cursor = reviewsCollection.find({email:query});
      const result = await cursor.toArray();
      res.send(result);
      res.json(result)
    })

    app.post('/reviews',async(req,res)=>{
      const reviews = req.body;
      const result = await reviewsCollection.insertOne(reviews);
      res.send(result);
    })

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
          isAdmin = true;
      }
      res.json({ admin: isAdmin });
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

  app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
  })
    

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})