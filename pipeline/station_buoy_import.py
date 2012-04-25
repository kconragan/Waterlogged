#!/usr/bin/env python

import csv
import sys
from urllib import urlopen

# pip install geojson --user
import geojson
import simplejson

NDBCSTATIONS = "http://www.ndbc.noaa.gov/ndbcmapstations.json"

# Get stations, fix escapes.
ndbc = simplejson.loads(urlopen(NDBCSTATIONS).read().replace("\\'", "'"))

# Stations have refs to other places in the JSON, owner and program.
writer = csv.DictWriter(sys.stdout,
                        sorted(["elev", "seq"] + ndbc['station'][0].keys()), 0)

import pdb; pdb.set_trace()

geoj = []
for station in ndbc['station']:
  station['owner'] = ndbc['owner'][int(station['owner'])]
  station['program'] = ndbc['program'][int(station['program'])]

  # Convert to GeoJSON
  #p = geojson.Point([station['lat'], station['lon']])
  #f = geojson.Feature(geometry=p)

  #f.properties['status'] = station['status']
  #f.properties['owner'] = station['owner']
  #f.properties['name'] = station['name']
  #f.properties['buoytype'] = station['type']
  #f.properties['data'] = station['data']
  #f.properties['id'] = station['id']
  #geoj.append(f)
  writer.writerow(station)

#fc = geojson.FeatureCollection(geoj)
#print geojson.dumps(fc)
