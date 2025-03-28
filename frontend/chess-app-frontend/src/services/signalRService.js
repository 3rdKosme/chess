import { HubConnectionBuilder } from '@microsoft/signalr';

let connection = null;

export const startSignalRConnection = (gameId, updateBoard) => {
    if(!gameId){
        console.error("Cannot start SignalR connection: gameID is null");
        return Promise.reject("gameID is null");
    }
    connection = new HubConnectionBuilder().withUrl('http://localhost:5057/gamehub').build();

    connection.on("ReceiveMove", (move) => {
        console.log(`Received Move: ${move}`);
        updateBoard(move);
    });


    return connection.start().then(() => {
        console.log("Connected to SignalR hub");
        return connection.invoke("JoinGame", gameId)
    }).catch(err => {
        console.error("Error starting SignalR connection:", err);
        throw err;
    });
};

export const sendMove = (gameId, move) => {
    if (!connection || connection.state !== "Connected") {
        console.error("SignalR connection is not in the 'Connected' state.");
        return;
    }
    if (!gameId) {
        console.error("Cannot send move: gameId is null.");
        return;
    }
    connection.invoke("SendMove", gameId, move).catch(err => console.error(err));
};