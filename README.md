# Waterlogged

Author: _kai.conragan@gmail.com_ (Kai Conragan)

A node.js/MongoDB app for logging surf sessions, integrated with NDBC databases
for pulling in buoy readings.

## Planned Features
- **Effortless logging UI** for both desktop and mobile. Only enter the fun
	stuff, the system loads the rest (buoys, tide, etc.)
- **Privacy controls** to keep your secret spots secret
- **Dashboard** for obsessing over personal data (# of surf sessions, average
	duration, etc.)

## TODO
- finish buoy data generation
- figure out source for tide & wind
  - http://www.wunderground.com/weather/api/d/pricing.html
  - Google Weather (but no historical lookups)
- figure out source for wind information (needs to accept time parameter)
- Pull in Freebase buoy data and load instances using current Buoy model. Most
	important data: Name, geolocation (for geospatial querying), and Freebase
	mid.
- Get mock data loaded from Daytum export
- Figure data model for User -> Surf Spots.
- Basic dashboard UI
- Mobiel UI for logging sessions from the beach.
