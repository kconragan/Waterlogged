mongoose = require 'mongoose'
Schema = mongoose.Schema

Buoy = new Schema(
  name: String
  noaa: String
  mid: String
  location:
    lng: Number
    lat: Number
)
exports.Buoy = mongoose.model("Buoy", Buoy)

SurfSpot = new Schema(
  name: String
  location:
    lng: Number
    lat: Number
  Buoys: [ Buoy ]
)
exports.SurfSpot = mongoose.model("SurfSpot", SurfSpot)

SurfSession = new Schema(
  date: Date
  surfSpot: [ SurfSpot ]
)
exports.SurfSession = mongoose.model("SurfSession", SurfSession)
