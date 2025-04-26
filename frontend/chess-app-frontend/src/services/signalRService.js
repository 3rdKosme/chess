import { HubConnectionBuilder } from '@microsoft/signalr';

let connection = null;

export const startSignalRConnection = (gameId, updateBoard) => {
    if(!gameId){
        console.error("Cannot start SignalR connection: gameID is null");
        return Promise.reject("gameID is null");
    }

    if(connection){
        console.warn("SignalR connection is already exist. Skipping...");
        return Promise.resolve();
    }
    connection = new HubConnectionBuilder().withUrl('http://localhost:5057/gamehub').build();

    connection.on("ReceiveMove", (move, gamestate, time) => {
        try{
            
            console.log(`Received Move: ${move}`);
            console.log(`Current gameState: ${gamestate}`);
            console.log(`Opponent time: ${time}`);
            updateBoard(move, gamestate, time);
        } catch (error) {
            console.error("failed to apply move: ", error);
            alert("Error occured");
        }
        
    });


    return connection.start().then(() => {
        console.log("Connected to SignalR hub");
        if(connection.state === "Connected"){
            return connection.invoke("JoinGame", gameId);
        } else{
            throw new Error("SignalR connecton is not in the 'Connected' state!");
        }
        
    }).catch(err => {
        console.error("Error starting SignalR connection:", err);
        throw err;
    });
};
