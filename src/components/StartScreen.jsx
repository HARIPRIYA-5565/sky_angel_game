import React from "react";

export default function StartScreen({onStart}){
return(
<div className="start-screen">
    <h1>Welcome to the game Sky Angel</h1>
    <h2>Let's Start !</h2>
    <button onClick={onStart}>Start Game</button>
</div>

);
};