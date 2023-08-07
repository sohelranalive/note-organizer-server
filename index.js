const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3krokas.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();

        const noteCollection = client.db("noteOrganizer").collection("note");

        app.get('/note', async (req, res) => {
            const noteStatus = req.query.status;
            const filter = { status: noteStatus }
            const result = await noteCollection.find(filter).toArray()
            res.send(result)
        })
        app.get("/allnotes/:text", async (req, res) => {
            const text = req.params.text;
            const filter = {
                $or: [
                    { title: { $regex: text, $options: "i" } },
                    { description: { $regex: text, $options: "i" } }
                ]
            };

            const result = await noteCollection.find(filter).toArray();
            res.send(result);
        });

        app.get('/note/:id', async (req, res) => {
            const noteId = req.params.id;
            const filter = { _id: new ObjectId(noteId) }
            const result = await noteCollection.findOne(filter)
            res.send(result);
        })

        app.post('/note', async (req, res) => {
            const noteInfo = req.body;
            const result = await noteCollection.insertOne(noteInfo)
            res.send(result)
        })

        app.delete('/note', async (req, res) => {
            const noteInfo = req.query.id;
            const filter = { _id: new ObjectId(noteInfo) }
            const result = await noteCollection.deleteOne(filter)
            res.send(result)
        })
        app.patch('/note', async (req, res) => {
            const noteInfo = req.query.id;
            const noteInfoDetails = req.body
            const filter = { _id: new ObjectId(noteInfo) }
            const updatedInfo = {
                $set: {
                    status: noteInfoDetails.status
                },
            };
            const result = await noteCollection.updateOne(filter, updatedInfo)
            res.send(result)
        })
        app.patch('/note/:id', async (req, res) => {
            const noteId = req.params.id;
            const updatedNoteDetails = req.body
            const filter = { _id: new ObjectId(noteId) }
            const updatedInfo = {
                $set: {
                    title: updatedNoteDetails.title,
                    description: updatedNoteDetails.description
                },
            };
            const result = await noteCollection.updateOne(filter, updatedInfo)
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


app.get('/', (req, res) => {
    res.send('Note Organizer server is running')
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})