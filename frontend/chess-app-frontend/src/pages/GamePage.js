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
    const [selectedTime, setSelectedTime] = useState(null);
    const [playerColor, setPlayerColor] = useState(null);
    const lastSentMoveRef = useRef({san: null, fen: null});
    const [blackTime, setBlackTime] = useState(null);
    const [whiteTime, setWhiteTime] = useState(null);
    const [isPrivate, setIsPrivate] = useState(false);
    

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
            setBlackTime(selectedTime);
            setWhiteTime(selectedTime);
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

    return (
        <div>
            <h2>Game Page</h2>
            

            {isLoading ? (
                <p>Loading game...</p>
            ) : gameId ? (

                <div style={{
                    height: '80vh',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '10px',
                    boxSizing: 'border-box',
                }}>
                    {/* Opponent */}
                    <div style={{
                        width: '100%',
                        maxWidth: '900px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                        fontSize: '20px',
                    }}>
                        <div>Opponent ({playerColor === "w" ? "Black" : "White"})</div>
                        <div>
                            {playerColor === "b" 
                                ? `${Math.floor(whiteTime / 60)}:${String(whiteTime % 60).padStart(2, '0')}`
                                : `${Math.floor(blackTime / 60)}:${String(blackTime % 60).padStart(2, '0')}`
                            }
                        </div>
                    </div>
                
                    {/* Main block(board+PGN) */}
                    <div style={{
                        flexGrow: 1,
                        width: '100%',
                        maxWidth: '900px',
                        display: 'flex',
                        gap: '10px',
                    }}>
                        {/* ChessBoard */}
                        <div style={{
                            flex: 1,
                            backgroundColor: '#f0f0f0',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                maxWidth: '100%',
                                maxHeight: '100%',
                                aspectRatio: '1 / 1',
                            }}>
                                <Chessboard
                                    position={gameState.fen()}
                                    onPieceDrop={handleMove}
                                    boardOrientation={playerColor === "w" ? 'white' : 'black'}
                                />
                            </div>
                        </div>
                
                        {/* PGN block */}
                        <div style={{
                            flex: 1,
                            backgroundColor: '#e0e0e0',
                            padding: '10px',
                            overflowY: 'auto',
                        }}>
                            {/* PGN */}
                            Game ID to join: {gameId}<br/>
                            PGN will be here
                        </div>
                    </div>
                
                    {/* Player block */}
                    <div style={{
                        width: '100%',
                        maxWidth: '900px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '10px',
                        fontSize: '20px',
                    }}>
                        <div>You ({playerColor === "w" ? "White" : "Black"})</div>
                        <div>
                            {playerColor === "w" 
                                ? `${Math.floor(whiteTime / 60)}:${String(whiteTime % 60).padStart(2, '0')}`
                                : `${Math.floor(blackTime / 60)}:${String(blackTime % 60).padStart(2, '0')}`
                            }
                        </div>
                    </div>
                
                    {/* EndGame Messages */}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
                    {/* Блок создания игры */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input 
                                type="checkbox" 
                                id="private-game" 
                                checked={isPrivate} 
                                onChange={(e) => setIsPrivate(e.target.checked)}
                            />
                            <label htmlFor="private-game">Приватная игра</label>
                        </div>
        
                        <select 
                            value={selectedTime} 
                            onChange={(e) => setSelectedTime(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px' }}
                        >
                            <option value="0">1 минута</option>
                            <option value="1">1 минута | 1 секунда добавление</option>
                            <option value="2">2 минуты | 1 секунда добавление</option>
                            <option value="3">3 минуты</option>
                            <option value="4">3 минуты | 2 секунды добавление</option>
                            <option value="5">5 минут</option>
                            <option value="6">10 минут</option>
                            <option value="7">15 минут | 10 секунд добавление</option>
                            <option value="8">30 минут</option>
                        </select>
        
                        <button 
                            onClick={handleCreateGame}
                            style={{ 
                                padding: '10px', 
                                backgroundColor: '#4CAF50', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Играть
                        </button>
                    </div>

                    {/* Блок присоединения к игре */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                placeholder="Введите ID игры"
                                value={inputGameId || ""}
                                onChange={(e) => setInputGameId(e.target.value)}
                                style={{ flexGrow: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                            <button 
                                onClick={handleJoinGame}
                                style={{ 
                                    padding: '8px 16px', 
                                    backgroundColor: '#2196F3', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Присоединиться
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            
        </div>
    );
};

export default GamePage;
