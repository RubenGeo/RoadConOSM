import psycopg2
from settings import *
import pprint
import json

# Set DB cursur
connDB = psycopg2.connect(("dbname='"+dbName+"' user='"+dbUsername+"' host='"+dbHost+"' password='"+dbPassword+"'"))
cur = connDB.cursor()

#Define road types of interest
roadTypes = ['primary', 'tertiary']



def create_error_message(potentialWrongTagIds, roadType):
    pontentialWrongTagErrors = []
    
    for id in potentialWrongTagIds:
        errorMessage = 'Road with id: '+ str(id) + ' could have a wrong tag, the tag may be ' + roadType
        pontentialWrongTagErrors.append([id, errorMessage])
    return pontentialWrongTagErrors
        
def find_end_connection_to_2different_tags(roadTypes):
    wronglyTaggedWays = {}
    allPotentialWrongTagErrors = []
    
    for roadType in roadTypes:
        
        #Select all end points of the ways of interest
        sql = "SELECT start_point FROM end_nodes WHERE fclass = %s;"
        cur.execute(sql, (roadType,))
        fetch = cur.fetchall()
        startPointSelection = tuple(fetch)

        #Select all start points of the ways of interest
        sql = "SELECT end_point FROM end_nodes WHERE fclass = %s;"
        cur.execute(sql, (roadType,))
        fetch = cur.fetchall()
        endPointSelection = tuple(fetch)

        allPointSelection = startPointSelection + endPointSelection

        #Select all ways that are connected to the start point of a way of interest
        sql = "SELECT OSMID from end_nodes WHERE start_point IN %s AND NOT fclass = %s;" 
        cur.execute(sql,(allPointSelection, roadType,))
        waysStartPointConnected = cur.fetchall()

        #Select all ways that are connected to the end point of a way of interest
        sql = "SELECT OSMID from end_nodes WHERE end_point IN %s AND NOT fclass = %s;" 
        cur.execute(sql,(allPointSelection, roadType,))
        waysEndPointConnected = cur.fetchall()

        #Find ways that are in both list so which are connect to two end point of a different road type
        potentialWrongTagIds = [val for val in waysStartPointConnected if val in waysEndPointConnected]
        wronglyTaggedWays[roadType] = potentialWrongTagIds
        
        pontentialWrongTagErrors = create_error_message(potentialWrongTagIds, roadType)
        
        #Creates a list of all poterntial errors with every tag
        allPotentialWrongTagErrors.extend(pontentialWrongTagErrors)
        
        
        print(waysStartPointConnected)
        print(waysEndPointConnected)
    
    print(allPotentialWrongTagErrors)
    return allPotentialWrongTagErrors
    
def create_wrongway_class(listWayId):
    class potentialWrongWayClass:       
        def __init__(self, osmId, length, type, startPoint, endPoint, latLongStart, latLongEnd, errorMes):
            self.osmId = osmId
            self.length = length
            self.type = type
            self.startPoint = startPoint
            self.endPoint = endPoint
            self.latLongStart = latLongStart
            self.latLongEnd = latLongEnd
            self.errorMes = errorMes

    listOfWayInstances = []        
    for way in listWayId:
        wayId = way[0]
        sql = "SELECT * from end_nodes WHERE OSMID  = %s;" 
        cur.execute(sql, (wayId,))
        wayInfo = cur.fetchall()
        wayInfo = wayInfo[0]
        
        sql = "SELECT ST_Y(start_point), ST_X(start_point), ST_Y(end_point), ST_X(end_point) from end_nodes WHERE OSMID  = %s;"        
        cur.execute(sql, (wayId,))
        
        
        
        
        
        latLongs = cur.fetchall()
        latLongs = latLongs[0]
        errorMes = way[1]
        x = potentialWrongWayClass(wayInfo[1], wayInfo[2], wayInfo[3], wayInfo[4], wayInfo[5], [latLongs[0], latLongs[1]], [latLongs[2],latLongs[3]], errorMes)
        listOfWayInstances.append(x)
    print(listOfWayInstances)
    return listOfWayInstances
    


def delete_ways_also_connected_to_self(listPotentialWrongWays):
    for way in listPotentialWrongWays:
        i = 1    
    


def write_errors_to_json(listPotentialWrongWays, jsonOutName):
    listOfWayDicts= []
    
    #This should be changed to a proper error message
    #errorMes = 'This potential error has yet to be defined'
    
    
    for way in listPotentialWrongWays:
        print( way.type)
        dictWays = {'OsmId':way.osmId, 'latLongStart': way.latLongStart, 'latLongEnd' : way.latLongEnd, 'errorStatus' : 'open', 'errorMes' : way.errorMes}
        listOfWayDicts.append(dictWays)

    with open(jsonOutName, 'w') as outfile:
        json.dump(listOfWayDicts, outfile)
        pprint.pprint(listOfWayDicts)
        
potentialWrongTagIds = find_end_connection_to_2different_tags(roadTypes)

listPotentialWrongWays = create_wrongway_class(potentialWrongTagIds)
jsonOutName = 'outErrors1.json'
write_errors_to_json(listPotentialWrongWays, jsonOutName)


jsonOutName = 'outErrors1.json'

# errorMes  = 'This error message has yet to be defined'

# testList = [[24951029, errorMes],[28972086, errorMes],[30723581, errorMes]]
# testOutList = create_wrongway_class(testList)
# write_errors_to_json(testOutList, jsonOutName)


# print (testOutList[0].latLongStart)
# print (testOutList[0].latLongEnd)


