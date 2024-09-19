import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dns from "dns";
import mongoose from "mongoose";
import { Url } from "./model.js";
import bodyParser from "body-parser";

const app = express();

// Middlewares
dotenv.config();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

// Configs
const port = process.env.PORT || 3000;

// Endpoints
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/shorturl", async (req, res) => {
  let url = req.body.url
  console.log(url)

  try {
    url = new URL(url)
    await dns.promises.lookup(url.hostname)
  }
  catch (error) {
    return res.json({
      error: 'invalid url'
    })
  }
  // Check if url exists
  const model = await Url.find({ original_url: url })
  if (model.length !== 0) {
    return res.status(200).json({
      original_url: model[0].original_url,
      short_url: model[0].short_url
    })
  }

  let count = await Url.countDocuments()
  count++

  const newUrl = await Url.create({
    original_url: url,
    short_url: count
  })

  return res.status(200).json({
    "original_url": url,
    "short_url": count
  })
})

app.get("/api/shorturl/:short_url", async (req, res) => {
  const short_url = req.params.short_url
  if (!short_url) {
    return res.status(400).json({
      "error": "No specified short_url"
    })
  }
  const doc = await Url.find({ short_url: short_url })
  if (doc.length === 0) {
    return res.status(404).json({
      "error": "Url doesn't exist"
    })
  }
  res.redirect(doc[0].original_url)
})

// Connect to db and start server
mongoose.connect(process.env.MONGO_URI)
  .then(
    console.log("Successfully connected to database!!!"),
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    })
  )
  .catch(err => console.log(err))



