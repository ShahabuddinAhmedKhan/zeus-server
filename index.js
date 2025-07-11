
require('dotenv').config()
const express = require('express');
const cors = require('cors');

app = express()
port = process.env.PORT || 5031

// middleware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7m2yxdr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const zeusCollection = client.db("zeusDB").collection("users")
        const equipmentCollection = client.db("zeusDB").collection("equipments")

        // users related api
        app.post("/users", async (req, res) => {
            const info = req.body;
            const result = await zeusCollection.insertOne(info)
            res.send(result)
        })

        app.patch("/users", async (req, res) => {
            const update = req.body
            const email = update.email
            const filter = { email }
            const updateDoc = {
                $set: {
                    lastSignInTime: update.lastSignInTime

                }
            }
            const result = await zeusCollection.updateOne(filter, updateDoc)
            res.send(result)

        })
        // equipment related apis

        app.post("/equipments", async (req, res) => {
            const equipment = req.body
            const result = await equipmentCollection.insertOne(equipment)
            res.send(result)

        })
        app.get("/equipments", async (req, res) => {
            const cursor = equipmentCollection.find()
            const result = await cursor.toArray()
            res.send(result)

        })
        app.get("/sixProducts", async (req, res) => {
            const cursor = equipmentCollection.find().limit(6)
            const result = await cursor.toArray()
            res.send(result)

        })

        app.get(`/equipments/:id`, async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await equipmentCollection.findOne(query)
            res.send(result)


        })
        app.get(`/category/:name`, async (req, res) => {
            const name = req.params.name
            console.log("name",name);
            
            const query = { category: name }
            const category =  equipmentCollection.find(query)
            result = await category.toArray()

            res.send(result)


        })
        // my equipments
        app.get(`/myEquipment/:mail`, async(req, res) => {
            const mail = req.params.mail;
            const query = {email: mail};
            const cursor = equipmentCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("zeus server working")
})

app.listen(port, () => {
    console.log("port activated at", port);

})