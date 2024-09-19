import mongoose from "mongoose"

const urlSchema = new mongoose.Schema({
  "original_url": {
    type: String,
    required: true
  },
  "short_url": {
    type: String
  }
})
const Url = mongoose.model("Url", urlSchema)

export { Url }

