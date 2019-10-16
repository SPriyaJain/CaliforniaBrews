map = new OpenLayers.Map("mapdiv");
map.addLayer(new OpenLayers.Layer.OSM());

// SETTING UP OPENSTREETMAP
// have starting center point for the user, for appealing view of California
const startingPoint = new OpenLayers.LonLat(-120, 38)
    .transform(
    new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
    map.getProjectionObject() // to Spherical Mercator Projection
);

// starting zoom level to view all of California
const zoom = 5.5;
const markers = new OpenLayers.Layer.Markers( "Markers" );
map.addLayer(markers);

// IMPLEMENTING OPENBREWERYDB
// indicate that further requests for api pagination must be made
let moreData = true;
const perPage = 20;

function getAllBreweries(page) {
    fetch('https://api.openbrewerydb.org/breweries?by_state=california&page=' + page)
    .then(
        function(response) {
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' +
                    response.status);
                return;
            }
            response.json().then(function(data) {
                const brews = data;
                console.log("brews", brews);
                if (!brews || brews.length < perPage) {
                    moreData = false;
                } else {
                    for (let i = 0; i < brews.length; i++) {
                        let long = brews[i].longitude;
                        let lat = brews[i].latitude

                        // do not let data with no long/lat appear
                        // not a longitude of 0 nor latitude of 0 is within California
                        if (!long || !lat) { break; }
                        markers.addMarker(new OpenLayers.Marker(
                            new OpenLayers.LonLat( long, lat )
                            .transform(
                                new OpenLayers.Projection("EPSG:4326"),
                                map.getProjectionObject()
                            )
                        ));
                    }
                    // recursive fetch call
                    getAllBreweries(page + 1);
                }
            });
        }
    )
    .catch(function(err) {
        console.log('Fetch Error :-S', err);
    });
}

getAllBreweries(0);

map.setCenter(startingPoint, zoom);
