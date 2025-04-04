import React, { useEffect, useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { startSignalRConnection, sendMove } from '../services/signalRService';
import { createGame, makeMove} from '../services/apiService';

let isGameInitialized = false;

const GamePage = () => {
    
    const [gameId, setGameId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [gameState, setGameState] = useState(new Chess());
    const [whiteTime, setWhiteTime] = useState(600);
    const [blackTime, setBlackTime] = useState(600);
    const [currentPlayer, setCurrentPlayer] = useState('w');
    
    //const [position, setPosition] = useState('start');

    const handleMove = (sourceSquare, targetSquare) => {
        const move = gameState.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q',
        });

        if(move){
            setGameState(new Chess(gameState.fen()));
            setCurrentPlayer(gameState.turn());
            sendMove(gameId, move.san);
            makeMove(gameId, move.san).catch(err => console.error(err));
        }
        return !!move;        
    };

    const handleOpponentMove = useCallback((move) => {
        console.log(`Received opponent move: ${move}`);
        gameState.move(move);
        setGameState(new Chess(gameState.fen()));
        setCurrentPlayer(gameState.turn);
    }, [gameState]);

    useEffect(() => {
        if(isGameInitialized) return;
        isGameInitialized = true;
           
        const initializeGame = async () => {    
             
            try{
                setIsLoading(true);
                console.log("Creating game...");
                const response = await createGame();
                console.log("RESPONSE DATA: ", response.data);
                
                const id = response.data.gameId;
                if(!id){
                    throw new Error("Invalid game ID received from server.");
                }
                console.log(`Game created with ID: ${id}`);
                setGameId(id);
                
                await startSignalRConnection(id, handleOpponentMove);
            } catch (err) {
               console.error("Error initializing the game or SignalR connection: ", err);
            } finally{
                setIsLoading(false);
            }
        };
        initializeGame();        

    }, [handleOpponentMove]);

    useEffect(() => {
        let interval = null;

        if(!isLoading && gameId){
            interval = setInterval(() => {
                if(currentPlayer === 'w'){
                    setWhiteTime((prevTime) => prevTime - 1);
                } else {
                    setBlackTime((prevTime) => prevTime - 1);
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [currentPlayer, isLoading, gameId]);

    const isCheckmate = gameState.isGameOver() && gameState.inCheck();
    const isStalemate = gameState.isGameOver() && !gameState.inCheck();

    return (
        <div>
            <h2>Game Page</h2>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '10px'}}>
                <div>White Time: {Math.floor(whiteTime / 60)} : {String(whiteTime % 60).padStart(2, '0')}</div>
                <div>Black Time: {Math.floor(blackTime / 60)} : {String(blackTime % 60).padStart(2, '0')}</div>
            </div>

            {isLoading ? (
                <p>Loading game...</p>
            ) : gameId ? (
                <div>
                    <Chessboard position={gameState.fen()}
                        onPieceDrop={handleMove}
                    />
                    <div>
                        {isCheckmate && <p>Checkmate! Game over.</p>}
                        {isStalemate && <p>Stalemate! Game over.</p>}
                    </div>
                </div>
            ) : (
                <p>Failed to load game.</p>
            )}
            
        </div>
    );
};

export default GamePage;
