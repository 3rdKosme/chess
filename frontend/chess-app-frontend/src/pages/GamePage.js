import React, { useEffect, useState } from 'react';
import ChessboardComponent from '../components/Chessboard';
import { startSignalRConnection, sendMove } from '../services/signalRService';
import { createGame, makeMove} from '../services/apiService';

const GamePage = () => {
    const [gameId, setGameId] = useState(null);
    const [position, setPosition] = useState('start');

    useEffect(() => {
        createGame().then(response => {
            const id = response.data.gameId;
            if(!id){
                throw new Error("Invalid game ID received from server.");
            }
            console.log(`Game created with ID: ${id}`);
            setGameId(id);
            startSignalRConnection(id, updateBoard);
        }).catch(err => console.error(err));
    }, []);

    const updateBoard = (move) => {
        console.log(`Undating board with move: ${move}`);
        setPosition((prevPosition) => {
            //updating board logic
            return prevPosition;
        });
    };

    const handleMove = (move) => {
        console.log(`Sending move: ${move}`);
        if(!gameID){
            console.error("gameID is null");
        }
        sendMove(gameId, move);
        makeMove(gameId, move).catch(err => console.error(err));
    };

    return (
        <div>
            <h2>Game Page</h2>
            {gameId ? <ChessboardComponent onMove={handleMove}/> : <p>Loading game...</p>}
        </div>
    );
};

export default GamePage;
