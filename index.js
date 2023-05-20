const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Toy Galaxy Server is running.");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.MONGODB_URL;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("toygalaxyDB");
    const toys = database.collection("toys");

    app.post("/addtoy", async (req, res) => {
      const toyData = req.body;
      const result = await toys.insertOne(toyData);
      res.send(result);
    });

    app.get("/toys", async (req, res) => {
      const page = parseInt(req.query.pageNumber) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const totalToys = await toys.estimatedDocumentCount();
      const cursor = toys.find().skip(skip).limit(limit);

      const result = await cursor.toArray();
      res.send({ result, totalToys });
    });

    app.get("/toy/:toyId", async (req, res) => {
      const result = await toys.findOne({
        _id: new ObjectId(req.params.toyId),
      });
      res.send(result);
    });

    app.get("/mytoys/:userEmail", async (req, res) => {
      const userEmail = req.params.userEmail;

      const cursor = toys.find({
        sellerEmail: userEmail,
      });

      const totalToys = await toys.countDocuments({ sellerEmail: userEmail });
      const result = await cursor.toArray();
      res.send({ result, totalToys });
    });

    app.patch("/toy/:toyId", async (req, res) => {
      const filter = { _id: new ObjectId(req.params.toyId) };

      const { price, quantity, description } = req.body;

      const updateDoc = {
        $set: {
          price: price,
          quantity: quantity,
          description: description,
        },
      };
      const result = await toys.updateOne(filter, updateDoc);
      res.status(200).send(result);
    });

    app.delete("/toy/:toyId", async (req, res) => {
      const query = { _id: new ObjectId(req.params.toyId) };

      const result = await toys.deleteOne(query);
      if (result.deletedCount === 1) {
        res.status(200).send(result);
      } else {
        res.status(401).send(result);
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Toy Galaxy Server listening on port ${port}`);
});
