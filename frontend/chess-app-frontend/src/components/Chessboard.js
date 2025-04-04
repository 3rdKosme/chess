import React, { useCallback, useState } from 'react';
import { Chessboard } from 'react-chessboard';

const ChessboardComponent = ({ onMove }) => {
    const [ position, setPosition ] = useState('start');
    console.log("Current position: ", position);
    
    const onDrop = useCallback((sourceSquare, targetSquare) => {
        
        const move = `${sourceSquare}-${targetSquare}`;
        onMove(move);
        setPosition((prevPosition) => {
            //gamerules ... business-logic ...
            return prevPosition;
        })
        return true;
    }, [onMove]);

    return (
        <div style={{ width: '500px', margin: '0 auto' }}>
            <h2>Chess Board</h2>
            <Chessboard position="start" onPieceDrop={onDrop} />
        </div>
    );
};

export default ChessboardComponent;
