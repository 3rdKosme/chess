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
    const [boardSize, setBoardSize] = useState(400);

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
            setIsCreatingGame(false);
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
    // time management
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

    // useEffect(() => {
    //     const updateSize = () => {
    //         const size = Math.min(window.innerHeight, window.innerHeight) * 0.9;
    //         setBoardSize(size);
    //     }
    //     updateSize();
    //     window.addEventListener('resize', updateSize);
    //     return () => window.removeEventListener('resize', updateSize);
    // }, []);
    

    return (
        <div>
            <h2>Game Page</h2>
            

            {isLoading ? (
                <p>Loading game...</p>
            ) : gameId ? (
                // <div>
                //     <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '10px'}}>
                //         <div>White Time: {Math.floor(whiteTime / 60)} : {String(whiteTime % 60).padStart(2, '0')}</div>
                //         <div>Black Time: {Math.floor(blackTime / 60)} : {String(blackTime % 60).padStart(2, '0')}</div>
                //     </div>
                //     <div style={{
                //         width: `${boardSize}px`,
                //         height: `${boardSize}px`,
                //         margin: "0 auto",
                //         display: "flex",
                //         justifyContent: "center",
                //         alignItems: "center"
                //     }}>
                //         <Chessboard
                //         position={gameState.fen()}
                //         onPieceDrop={handleMove}
                //         boardOrientation={ playerColor === "w" ? 'white' : 'black'}
                //         boardWidth={boardSize}
                //         />
                //     </div>
                    
                //     <div>
                //         {gameState.isCheckmate() && <p>Checkmate! Game over.</p>}
                //         {gameState.isStalemate() && <p>Stalemate! Game over.</p>}
                //         {gameState.isInsufficientMaterial() && <p>Insufficient material! Game over.</p>}
                //         {gameState.isThreefoldRepetition() && <p>Threefold repetitions! Game over.</p>}
                //         {gameState.isDrawByFiftyMoves() && <p>50 moves rule! Game over.</p>}
                        
                //     </div>
                // </div>
                <div style={{
                    height: '80vh',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px',
                    boxSizing: 'border-box',
                }}>
                    {/* timers */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        width: '100%',
                        marginBottom: '10px',
                        fontSize: '20px',
                    }}>
                        <div>{playerColor === "b" ? Math.floor(whiteTime / 60) : Math.floor(blackTime / 60)}:{playerColor === "b" ? String(whiteTime % 60).padStart(2, '0') : String(blackTime % 60).padStart(2, '0')}</div>
                    </div>
                
                    {/* Board Container */}
                    <div style={{
                        flexGrow: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                    }}>
                        <div style={{
                            height: '100%',
                            aspectRatio: '1 / 1',
                            maxWidth: '100%',
                        }}>
                            <Chessboard
                                position={gameState.fen()}
                                onPieceDrop={handleMove}
                                boardOrientation={playerColor === "w" ? 'white' : 'black'}
                            />
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        width: '100%',
                        marginBottom: '10px',
                        fontSize: '20px',
                    }}>
                        <div>{playerColor === "w" ? Math.floor(whiteTime / 60) : Math.floor(blackTime / 60)}:{playerColor === "w" ? String(whiteTime % 60).padStart(2, '0') : String(blackTime % 60).padStart(2, '0')}</div>
                    </div>
                
                    {/* Endgame messages */}
                    <div style={{
                        marginTop: '10px',
                        textAlign: 'center',
                        fontSize: '18px',
                    }}>
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
