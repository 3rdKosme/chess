import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { startSignalRConnection } from '../services/signalRService';
import { createGame, makeMove, joinGame } from '../services/apiService';

let isGameInitialized = false;

const GamePage = () => {
    const [inputGameId, setInputGameId] = useState('');
    const [gameId, setGameId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [gameState, setGameState] = useState(new Chess());
    const [isCreatingGame, setIsCreatingGame] = useState(false);
    const [playerColor, setPlayerColor] = useState(null);
    const lastSentMoveRef = useRef({san: null, fen: null});
    const [blackTime, setBlackTime] = useState(600);
    const [whiteTime, setWhiteTime] = useState(600);

    const handleMove = async (sourceSquare, targetSquare, piece) => {
        try{
            if(gameState.turn() !== playerColor){
                alert("Not your turn!");
                return false;
            }
            console.log(gameState.moves());
            const move = gameState.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: piece[1].toLowerCase(),
            });
            if(move){
                
                setGameState(new Chess(gameState.fen()));
                console.log("updated fen after move:", gameState.fen());
                lastSentMoveRef.current = {
                    san: move.san,
                    fen: gameState.fen()
                };
                
                let answer = await makeMove(gameId, move.san, gameState.fen());
                console.log(answer);
                return true;
            } else{
                alert("Invalid move");
                return false;
            }
            
            

        } catch (error) {
            console.log("Catched error on handleMove: ", error);
            alert("An error occured");
            return false;
        }
    }

    

    const handleOpponentMove = useCallback((move, gamestate, time) => {
        console.log(`MEME: ${gamestate.split(' ')[1]}`);
        
        
        if(gamestate.split(' ')[1] === "w"){
            setBlackTime(time);
        } else {
            setWhiteTime(time);
        }
        
        if(move === lastSentMoveRef.current.san){
            console.log("Received my move");
            
            lastSentMoveRef.current = { san: null, fen: null };
            return;
        }
        
        console.log(`Received opponent move: ${move}`);
        //console.log("current gameState from front: ", gameState.fen());
        setGameState(new Chess(gamestate));
    }, []);

      
    const handleCreateGame = async () => {    
        if(isGameInitialized) return;
        isGameInitialized = true;
        try{
            setIsLoading(true);
            const response = await createGame();
            const id = response.data.gameId;
            if(!id){
                throw new Error("Invalid game ID received from server.");
            }
            console.log(`Game created with ID: ${id}`);
            setGameId(id);
            const color = response.data.userTurn;
            if(!color){
                throw new Error("Invalid Color received from server.");
            }
            console.log("You play as ", color);
            setPlayerColor(color);
            await startSignalRConnection(id, handleOpponentMove);
        } catch (err) {
           console.error("Error initializing the game or SignalR connection: ", err);
        } finally{
            setIsLoading(false);
        }
    };
    
    const handleJoinGame = async () => {
        if (!inputGameId || isNaN(Number(inputGameId))) {
            alert("Please enter a valid Game ID.");
            return;
        }
        
        try{
            setIsLoading(true);
            console.log(`Joining game with ID: ${inputGameId}`);
            const response = await joinGame(inputGameId);
            const color = response.data.userTurn;
            console.log(response.data.message);
            setPlayerColor(color);
            console.log("You play as ", color);
            await startSignalRConnection(inputGameId, handleOpponentMove);
        } catch (err) {
            console.log("Error joining the game or SignalR connection: ", err);
        } finally {
            setGameId(inputGameId);
            setIsLoading(false);
        }
    };

    

    // закомменчена пока не готовая часть с временем

    useEffect(() => {
        let interval = null;

        if(gameState.fen() !== "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"){
            interval = setInterval(() => {
                if(gameState.turn() === 'w'){
                    setWhiteTime((prevTime) => prevTime - 1);
                } else {
                    setBlackTime((prevTime) => prevTime - 1);
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [gameState]);

    

    return (
        <div>
            <h2>Game Page</h2>
            

            {isLoading ? (
                <p>Loading game...</p>
            ) : gameId ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '10px'}}>
                        <div>White Time: {Math.floor(whiteTime / 60)} : {String(whiteTime % 60).padStart(2, '0')}</div>
                        <div>Black Time: {Math.floor(blackTime / 60)} : {String(blackTime % 60).padStart(2, '0')}</div>
                    </div>
                    <Chessboard
                        /*onPromotionPieceSelect={handlePromotion}*/
                        position={gameState.fen()}
                        onPieceDrop={handleMove} // Передаем функцию обработки ходов
                        boardOrientation={ playerColor === "w" ? 'white' : 'black'}
                        
                    />
                    <div>
                        {gameState.isCheckmate() && <p>Checkmate! Game over.</p>}
                        {gameState.isStalemate() && <p>Stalemate! Game over.</p>}
                        {gameState.isInsufficientMaterial() && <p>Insufficient material! Game over.</p>}
                        {gameState.isThreefoldRepetition() && <p>Threefold repetitions! Game over.</p>}
                        {gameState.isDrawByFiftyMoves() && <p>50 moves rule! Game over.</p>}
                        
                    </div>
                </div>
            ) : (
                <div>
                    
                    <button onClick={() => setIsCreatingGame(true)}>CreateGame</button>
                    <div>
                        <input
                            type="text"
                            placeholder="Enter Game ID"
                            value={inputGameId || ""}
                            onChange={(e) => setInputGameId(e.target.value)}
                        />
                        <button onClick={handleJoinGame}>JoinGame</button>
                    </div>
                </div>
            )}
            {isCreatingGame && (
                <div>
                    <p>Creating a new game?</p>
                    <button onClick={handleCreateGame}>Confirm</button>
                </div>
            )}
            
        </div>
    );
};

export default GamePage;
