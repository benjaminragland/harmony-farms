require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const db = mongoose.connection;

const port = process.env.PORT || 8000;
const app = express();
const staticDir = process.env.DEV ? "./client/public" : "./client/build";

const url = `mongodb+srv://${process.env.user}:${process.env.password}@cluster0.idqix.mongodb.net/harmony-farms`;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

app.listen(port, () => {
  console.log(`Hearing you on port: ${port}`);
});

app.use(express.static(staticDir));

app.use(express.urlencoded({ extended: true }));

const testSchema = new mongoose.Schema({
  testContent: { type: String },
});

const Test = mongoose.model("Test", testSchema);

app.post("/test", async (req, res) => {
  let userObj = req.body;
  let newTestObj = new Test(userObj);
  await newTestObj.save();
  res.send("posted");
});

const animalSchema = new mongoose.Schema({
  animalName: { type: String },
  animalDescription: { type: String },
  imageLink: { type: String },
});

const Animal = mongoose.model("Animal", animalSchema);

app.post("/animalPost", async (req, res) => {
  let newObj = new Animal(req.body);
  await newObj.save();
  console.log("Animal Added");
  res.status(200).redirect("/admin/edit");
});

app.get("/api/animals", async (req, res) => {
  let animals = await Animal.find({});
  res.send(animals);
});

app.post("/delete", async (req, res) => {
  let target = await Animal.find({ animalName: req.body.animalDelete });
  console.log(target);
  let targetId = target[0]._id;
  await Animal.deleteOne({ _id: targetId });
  res.redirect("/admin/edit");
});

app.post("/edit", async (req, res) => {
  let target = await Animal.find({ animalName: req.body.animalName });
  let targetId = target[0]._id;
  console.log(targetId);
  console.log(req.body.animalDescription);
  if (req.body.animalDescription !== "") {
    await Animal.updateOne(
      { _id: targetId },
      { $set: { animalDescription: req.body.animalDescription } }
    );
  }
  if (req.body.imageLink !== "") {
    await Animal.updateOne(
      { _id: targetId },
      { $set: { imageLink: req.body.imageLink } }
    );
  }
  res.redirect("/admin/edit");
});
