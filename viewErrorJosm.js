var api = require("josm/api").Api;
var nbuilder = require("josm/builder").NodeBuilder;
var SimlePrimitiveId = org.openstreetmap.josm.data.osm.SimplePrimitiveId;
var OsmPrimitiveType = org.openstreetmap.josm.data.osm.OsmPrimitiveType;
var util = require("josm/util");
var console = require("josm/scriptingconsole");
var l = josm.layers.length;
var command = require("josm/command");

function get_current_dataset(){
    var layers = require("josm/layers");
    layer =  layers.activeLayer;
    var ds = layer.data;
    return ds;
};

function select_way_with_id(wayOfInterest){

    var ds = get_current_dataset()
    var allWays = ds.ways

    //Get some modules
    var util = require("josm/util");
    var command = require("josm/command");
    var console = require("josm/scriptingconsole");

    //Attempts to clear current selection
    ds.selection.clearAll();
    //ds.selection.remove(ds.selection)
    console.println(ds.selection)


    //Search for ways
    var result = ds.query("type:way");




    //Find ways that have the tagid and add them as selection
    for (j = 0; j < result.length; j++) {
        var way = result[j];
  
        var highwayID = way.id
        if (highwayID  === wayOfInterest){
            ds.selection.add(way)
            console.println("This is road number " + j )

        }    
    }



    var s = ds.selection;
    var ways = s.ways;  // now "ways" is a JavaScript array 


};


function download_box_from_lat_lon(lat, lon){
    var latMin = lat - 0.002
    var lonMin = lon - 0.002
    var latMax = lat + 0.002
    var lonMax = lon + 0.002


    var ds = api.downloadArea({
        min: {lat: latMin, lon: lonMin},
        max: {lat: latMax, lon: lonMax}
    });

    josm.layers.addDataLayer({ds: ds, name: "PotentialError"}); 
};



var wayID = 24951029

var latStart = -14.2956651 
var lonStart = 33.983665

var latEnd = -14.2807553
var lonEnd = 33.787281

function PotentialError (wayID, startPoint, endPoint) {
    this.wayID = wayID;
    this.startPoint = startPoint
    this.endPoint = endPoint
    this.errorMes = "nothing" 
}
 
PotentialError.prototype.show_error_area = function() {    
    download_box_from_lat_lon(this.startPoint[0], this.startPoint[1])
    download_box_from_lat_lon(this.endPoint[0], this.endPoint[1])
    select_way_with_id(this.wayID)
};

    
var testWay = new PotentialError(wayID, [latStart, lonStart], [latEnd, lonEnd])

testWay.show_error_area()


/* download_box_from_lat_lon(latStart, lonStart)
download_box_from_lat_lon(latEnd, lonEnd)
select_way_with_id(wayID) */

console.println(l)
console.println("Klaar " )

