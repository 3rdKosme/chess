import React, { useEffect, useState } from 'react';
import ChessboardComponent from '../components/Chessboard';
import { startSignalRConnection, sendMove } from '../services/signalRService';
import { createGame, makeMove} from '../services/apiService';

let isGameInitialized = false;

const GamePage = () => {
    
    const [gameId, setGameId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    //const [position, setPosition] = useState('start');

    useEffect(() => {
        if(isGameInitialized) return;
        isGameInitialized = true;
        let isMounted = true;
        
        
            
            
            console.log("Creating game...");
            
            try{
                const response = createGame();
                console.log("RESPONSE DATA: ", response.data);
                if(!isMounted) return;
                const id = response.data.gameId;
                if(!id){
                    throw new Error("Invalid game ID received from server.");
                }
                console.log(`Game created with ID: ${id}`);
                setGameId(id);
                
                startSignalRConnection(id, updateBoard);
            } catch (err) {
                console.error(err);
            } finally{
                setIsLoading(false);
            }
        

        return () => {
            isMounted = false;
        };
    }, []);

    const updateBoard = (move) => {
        console.log(`Undating board with move: ${move}`);
        //setPosition((prevPosition) => {
            //updating board logic
        //    return prevPosition;
       // });
    };

    const handleMove = (move) => {
        console.log(`Sending move: ${move}`);
        if(!gameId){
            console.error("gameID is null");
            return;
        }
        sendMove(gameId, move);
        makeMove(gameId, move).catch(err => console.error(err));
    };

    return (
        <div>
            <h2>Game Page</h2>
            {isLoading ? (<p>Loading Game...</p>) : (gameId ? <ChessboardComponent onMove={handleMove}/> : <p>Failed to load game</p>)}
            
        </div>
    );
};

export default GamePage;
