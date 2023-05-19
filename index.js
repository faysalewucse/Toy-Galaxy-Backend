const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use("/", (req, res) => {
  res.send("Toy Galaxy Server is running.");
});

app.listen(port, () => {
  console.log(`Toy Galaxy Server listening on port ${port}`);
});
