const express = require("express")
const {open} = require("sqlite")
const sqlite3 = require("sqlite3")

const path = require("path")
const dbPath = path.join(__dirname, "cricketTeam.db")
const app = express()
app.use(express.json());


let db = null;
const initializeDBAndServer = async () => {
   try{
        db = await open({
                    filename : dbPath,
                    driver: sqlite3.Database
                });
        app.listen(3000, ()=> {
            console.log("Server is running at http://localhost:3000/")
        });
   }catch(e){
        console.log(`DB Error - ${e.message}`)
        process.exit(1)
   }
} 

initializeDBAndServer();


const convertToCamelCase = (dataObj) => {
    return {
        playerId : dataObj.player_id,
        playerName : dataObj.player_name,
        jerseyNumber : dataObj.jersey_number,
        role : dataObj.role
    }
}

//1.GET All Players API
app.get("/players/", async (request, response) => {
    const getAllPlayersQuery = 
    `
        SELECT
            *
        FROM
            cricket_team
        ORDER BY
            player_id
    `
    const allPlayers = await db.all(getAllPlayersQuery);

    let camelCaseData = allPlayers.map((player) => convertToCamelCase(player))
    response.send(camelCaseData);
});

//2.Add  Player API
app.post("/players/", async (request, response) => {
    const playerDetails = request.body;
    const {
        playerName,
        jerseyNumber,
        role
    } = playerDetails;

    const addPlayerQuery = 
        `
            INSERT INTO
                cricket_team (player_name, jersey_number, role)
            VALUES (
                '${playerName}',
                 ${jerseyNumber},
                '${role}'
            )            

        `
    await db.run(addPlayerQuery);
    response.send("Player Added to Team")
});

//3.GET Player by pLayer_Id
app.get("/players/:playerId", async (request, response) => {
    const { playerId } = request.params;
    const getPlayerByIdQuery = 
        `
            SELECT
                *
            FROM
                cricket_team
            WHERE
                player_id = ${playerId}
        `    
    const playerDetails = await db.get(getPlayerByIdQuery);
    const convertedData = convertToCamelCase(playerDetails)
    response.send(convertedData);
});

//4.Update Player API
app.put("/players/:playerId", async (request, response) =>{
    const { playerId } = request.params;
    const playerDetails = request.body;
    const {
            playerName,
            jerseyNumber,
            role        
        } = playerDetails;
    
    const updatePlayerQuery = 
        `
            UPDATE 
                cricket_team
            SET
                player_name = '${playerName}',
                jersey_number = ${jerseyNumber},
                role = '${role}'
            WHERE
                player_id = ${playerId}
        `
    await db.run(updatePlayerQuery);
    response.send("Player Details Updated");
});

//5.Delete Player API
app.delete("/players/:playerId", async (request, response) => {
    const { playerId } = request.params;
    const deletePlayerQuery = 
        `
            DELETE FROM 
                cricket_team 
            WHERE
                player_id = ${playerId}           
        `    
    await db.run(deletePlayerQuery);
    response.send("Player Removed");
});


module.exports = app;