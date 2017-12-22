// Firs open manually open a background imagery you can use digital globe premium,
// but it may also be useful to open 

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
    var latMin = lat - 0.01
    var lonMin = lon - 0.01
    var latMax = lat + 0.01
    var lonMax = lon + 0.01

    
    var ds = api.downloadArea({
        min: {lat: latMin, lon: lonMin},
        max: {lat: latMax, lon: lonMax}
    });
    return ds
    
};




function PotentialError (wayID, startPoint, endPoint) {
    this.wayID = wayID;
    this.startPoint = startPoint
    this.endPoint = endPoint
    this.errorMes = "nothing" 
}
 
PotentialError.prototype.show_error_area = function() {    
    var ds1 =  download_box_from_lat_lon(this.startPoint[0], this.startPoint[1])
    var ds2 = download_box_from_lat_lon(this.endPoint[0], this.endPoint[1])

    
    //ds1.each(doeIets)
    
/*     function doeIets(p) {
        console.println(p)
        console.println('Hoi')
        ds2.add(p)
        console.println('Doei')
    } */


    
    josm.layers.addDataLayer({ds: ds1, name: "PotentialError"});
    josm.layers.addDataLayer({ds: ds1, name: "PotentialError"});

    select_way_with_id(this.wayID)
};


function loop_through_errors(errorList){
    errorList.forEach(function(wayError) {
        console.println(wayError.wayID);
        
        wayError.show_error_area()
        
        josm.alert(wayError.wayID)
        
        var layers = require("josm/layers");
        layers.remove("PotentialError");
        layers.remove("PotentialError");
    });
};

var wayID = 24951029

var latStart = -14.2956651 
var lonStart = 33.983665

var latEnd = -14.2807553
var lonEnd = 33.787281

var testWay = new PotentialError(wayID, [latStart, lonStart], [latEnd, lonEnd])

var wayID = 28972086

var latStart = -14.1708296
var lonStart = 33.6405743

var latEnd = -14.1394315
var lonEnd = 33.660154
var testWay1 = new PotentialError(wayID, [latStart, lonStart], [latEnd, lonEnd])

    
var listOfWays = [testWay, testWay1]

loop_through_errors(listOfWays)






console.println("Klaar " )

