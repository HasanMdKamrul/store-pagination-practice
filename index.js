const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 15000;

// ** use middle ware

app.use(cors());
app.use(express.json());

// ** test endpoint

app.get("/", (req, res) => res.send(`Our server is running at port ${port}`));

// ** Database connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7ikallh.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

// ** for interactions

const client = new MongoClient(uri);

// ** db connect

const dbConnect = async () => {
  try {
    await client.connect();
    console.log("db_connected");
  } catch (error) {
    console.log(error.message);
  }
};

dbConnect();

// ** database and collections

const storeProductCollection = client.db("fakeStore").collection("products");

// ** get the data from the database into the server

app.get("/products", async (req, res) => {
  try {
    // ** perPageData and currentPage
    // console.log(req.query.size, req.query.currentPage);
    const perPageData = +req.query.size;
    const currentPage = +req.query.currentPage;
    // ** no filter as we are requesting all the data from the db
    const query = {};
    const cursor = storeProductCollection.find(query);
    const products = await cursor
      .skip(currentPage * perPageData)
      .limit(perPageData)
      .toArray();
    const count = await storeProductCollection.estimatedDocumentCount();

    res.send({
      success: true,
      message: `Data succesfully got from DB`,
      data: products,
      count,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// ** app listen

app.listen(port, () => console.log(`server is running at port ${port}`));
