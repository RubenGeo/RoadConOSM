# POSTGRES setting User = postgis Database = roads password plukuwplan1
import psycopg2
from settings import *
import pprint
import json

# Set DB cursur
connDB = psycopg2.connect(("dbname='"+dbName+"' user='"+dbUsername+"' host='"+dbHost+"' password='"+dbPassword+"'"))
cur = connDB.cursor()

# roadType = 'primary'



tableName = 'end_nodes'
#Check if the table exists else create it
cur.execute("select * from information_schema.tables where table_name=%s", (tableName,))
tableExists = bool(cur.rowcount)

if tableExists == 0:
    cur.execute("CREATE TABLE " +tableName+" (id serial PRIMARY KEY, OSMID bigint, length float8, fclass varchar(30), start_point GEOMETRY(Point,3857), end_point GEOMETRY(Point,3857));")
    
print (tableName)

connDB.commit()
cur.execute("SELECT osm_id, ST_Length(geom), fclass, ST_AsGeoJSON(geom) FROM roads;")

fetch = cur.fetchall()

print(len(fetch))



def insert_end_DB(fetch, tableName):
    #insert all beginning and end point coordinates of all way into a table
    i = 0 
    for way in fetch:
        i += 1
        if i % 1000 == 0:
            print(i)
          
        allPoints = way[3]

        jsonPoints = json.loads(allPoints)
        jsonPointsCoor = jsonPoints['coordinates']

        startPoint= jsonPointsCoor[0][0]
        endPoint = jsonPointsCoor[0][-1]
        #cur.execute("INSERT INTO " +tableName+" (OSMID, length, fclass, start_point, end_point) VALUES (%s, ,%s, ,%s, %s, %s)", 
        sql = "INSERT INTO end_nodes (OSMID, length, fclass, start_point, end_point) VALUES (%s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 3857), ST_SetSRID(ST_MakePoint(%s, %s), 3857))"
        dturple = (int(way[0]), way[1], way[2], startPoint[0], startPoint[1], endPoint[0], endPoint[1]);
        
        
        cur.execute(sql, dturple)
        
    connDB.commit()

        
insert_end_DB(fetch, tableName)



    

