// import logo from './logo.svg';
// import './App.css';
import React from "react";
import { useState } from "react";
import GameScreen from "./components/GameScreen";
import StartScreen from "./components/StartScreen";
function App() {
const [gameStarted, setGameStarted]=useState(false);
const handleStart=()=>{
setGameStarted(true);
};
  return (
<div className='app-container'>
{!gameStarted ? <StartScreen onStart={handleStart}></StartScreen>: <GameScreen></GameScreen>}
</div>
    
  );
}

export default App;
