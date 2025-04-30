import React from 'react';
import {isLoading, setIsLoading } from './GamePage';
import { useNavigate } from 'react-router-dom';
import {createGame, joinGame } from '../services/apiService';

const HomePage = () => {
    const [isPrivate, setIsPrivate] = useState(false);
    const [selectedTime, setSelectedTime] = useState(null);
    const [inputGameId, setInputGameId] = useState('');
    const navigate = useNavigate();

    const handleCreateGame = async () =>{
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

    return (
        <div>
            <h2>Welcome to Chess game!</h2>
            <p>Create or join a game to start playing.</p>
            (
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
            )
        </div>
    );
};

export default HomePage;