

var console = require("josm/scriptingconsole");
function load_file(filePath){
    var Files = java.nio.file.Files;
    var Paths = java.nio.file.Paths;
    var Stream = java.util.stream.Stream;
    var Collectors = java.util.stream.Collectors;


    //var path  = "https://gist.githubusercontent.com/RubenGeo/b0e2bf2d2fcc2b641acc41594ed52010/raw/061e45df781c0c20d7f9b36e00298ac1597fb844/out.json";

    var console = require("josm/scriptingconsole");

    // read the lines in a list ...
    var lines = Files.lines(Paths.get(filePath)).collect(Collectors.toList());

    // It's only one line, parse it to json
    var line = lines.get(0)
    var obj = JSON.parse(line);

    return obj
} 


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

    //Search for ways
    var result = ds.query("type:way");

    //Find ways that have the id and add them as selection
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


function PotentialError (wayID, startPoint, endPoint, errorStatus) {
    this.wayID = wayID;
    this.startPoint = startPoint
    this.endPoint = endPoint
    this.errorStatus = errorStatus
    this.errorMes = "nothing" 
}
 
PotentialError.prototype.show_error_area = function() {    
    var ds1 =  download_box_from_lat_lon(this.startPoint[0], this.startPoint[1])
    var ds2 = download_box_from_lat_lon(this.endPoint[0], this.endPoint[1])   
    josm.layers.addDataLayer({ds: ds1, name: "PotentialError"});
    josm.layers.addDataLayer({ds: ds2, name: "PotentialError"});

    select_way_with_id(this.wayID)
};



function json_to_js_error_list(jsonObj){
    listOfErrors = []
    jsonObj.forEach(function(element) {
        currentError = new PotentialError(element.OsmId, element.latLongStart, element.latLongEnd, element.errorStatus)
        listOfErrors.push(currentError)
    });
    return listOfErrors 
} 

function update_error_list(errorList, i){
    errorList[i].errorStatus = 'closed'
    return errorList
}

function write_update_to_file(updatedJsonErrorList, filePath){


    var File = java.io.File;
    var PrintWriter = java.io.PrintWriter;
    var BufferedWriter = java.io.BufferedWriter;
    var FileWriter = java.io.FileWriter;
    var file = new File(filePath);
    var bw = new BufferedWriter(new FileWriter(file));
    stringJson = JSON.stringify(updatedJsonErrorList)
    bw.write(stringJson);
    bw.close();
};



// This function is the initial function that can be activated by the user
function go_to_next_error() {

    // Set settings
    var filePath = "C:/510/RoadConOSM/outErrors1.json";


    //Main 
    layers.remove("PotentialError");
    layers.remove("PotentialError");
    var jsonObj = load_file(filePath)
    var errorList = json_to_js_error_list(jsonObj)


    for (var i = 0; i < errorList.length; i++){
        if (errorList[i].errorStatus == 'open'){
            //console.println(errorList[i].wayID) 
            errorList[i].show_error_area()
            //this closes the error status in the error list
            var updatedJsonErrorList = update_error_list(jsonObj, i)
            break;
        }
    };
    write_update_to_file(updatedJsonErrorList, filePath)
    console.println(JSON.stringify(updatedJsonErrorList))
};

//Require needed modules
var api = require("josm/api").Api;
var nbuilder = require("josm/builder").NodeBuilder;
var SimlePrimitiveId = org.openstreetmap.josm.data.osm.SimplePrimitiveId;
var OsmPrimitiveType = org.openstreetmap.josm.data.osm.OsmPrimitiveType;
var util = require("josm/util");
var console = require("josm/scriptingconsole");
var command = require("josm/command");
var layers = require("josm/layers");

var JSAction = require("josm/ui/menu").JSAction; 
// Create the action that can be added in the menu
var action = new JSAction({
    name: "Next Error",
    tooltip: "This button shows the next error in the error list",
    toolbarId: "nexterror",
    onExecute: go_to_next_error
});

action.addToMenu(josm.menu.get("tools"));
//go_to_next_error();
