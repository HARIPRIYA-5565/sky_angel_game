import React, { useEffect, useState } from "react";
import './GameScreen.css';
import airplaneImage from "../assets/airplaneImage.png";
import cloudImagee from "../assets/cloudImagee.png";
import birdImage from "../assets/birdImage.png";
import parachuteImage from "../assets/parachute.png";
import starImage from "../assets/star.png"
import axios from 'axios';

export default function GameScreen() {
// states used for managing state
  const [time, setTime] = useState(0);
  const [fuel, setFuel] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [restart, setRestart] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  const [name, setName] = useState("");
  const [stars, setStars] = useState(0);
const [continueGame, setContinueGame] = useState(false);
 const [formSubmitted, setFormSubmitted] = useState(false);
const [rankingData, setRankingData] = useState([]);
const [starsPosition, setStarsPosition] = useState([]);
const [ranking, setRanking] = useState([]);
const [loadingRanking, setLoadingRanking] = useState(false);
const [errorFetchingRanking, setErrorFetchingRanking] = useState(false);

const starWidth = 30;
const starHeight = 30;
const numStars = 4;
const starSpeed = 2;
const generateStars = () => {
  const newStars = Array(numStars).fill(0).map(() => ({
    left: Math.random() * (screenWidth - starWidth),
    top: -starHeight,
  }));
  setStarsPosition(newStars);
};


  const aircraftWidth = 100;
  const aircraftHeight = 60;

  const [position, setPosition] = useState({
    left: (screenWidth - aircraftWidth) / 2,
    top: (screenHeight - aircraftHeight) / 2,
  });

  const [birdPositions, setBirdPositions] = useState([]);
  const birdWidth = 80;
  const birdHeight = 50;
  const numBirds = 5;
  const birdSpeed = 10;

  const [cloudsPosition, setCloudsPosition] = useState([
    { left: -100, top: Math.random() * (screenHeight - 100), direction: 'right' },
    { left: -200, top: Math.random() * (screenHeight - 100), direction: 'right' },
    { left: screenWidth + 100, top: Math.random() * (screenHeight - 100), direction: 'left' },
    { left: screenWidth + 200, top: Math.random() * (screenHeight - 100), direction: 'left' }
  ]);

  const [parachutes, setParachutes] = useState([]);
  const parachuteWidth = 50;
  const parachuteHeight = 70;
  const numParachutes = 6;
  const parachuteSpeed = 2;

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setPosition({
      left: (screenWidth - aircraftWidth) / 2,
      top: (screenHeight - aircraftHeight) / 2,
    });
  }, [screenWidth, screenHeight]);

  useEffect(() => {
    if (fuel > 0 && !gameOver && !paused) {
      const timer = setInterval(() => {
        setTime(prevTime => prevTime + 1);
        setFuel(prevFuel => prevFuel - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (fuel <= 0) {
      setGameOver(true);
    }
  }, [fuel, paused, gameOver]);

 useEffect(() => {
  if (restart || continueGame) {
    setTime(0);
    setFuel(20);
    setGameOver(false);
    setPaused(false);
    setStars(0);
    setPosition({
      left: (screenWidth - aircraftWidth) / 2,
      top: (screenHeight - aircraftHeight) / 2,
    });
    generateBirds();
    generateParachutes();
    generateStars();
    setRestart(false);
    setContinueGame(false);
  }
}, [restart, continueGame]);

  const generateBirds = () => {
    const newBirdPositions = Array(numBirds).fill(0).map(() => ({
      left: Math.random() < 0.5 ? -birdWidth : screenWidth,
      top: Math.floor(Math.random() * (screenHeight - birdHeight)),
      direction: Math.random() < 0.5 ? 'right' : 'left'
    }));
    setBirdPositions(newBirdPositions);
  };

 const generateParachutes = () => {
  const newParachutes = Array(numParachutes).fill(0).map(() => ({
    left: Math.random() * (screenWidth - parachuteWidth),
    top: -parachuteHeight,
  }));
  setParachutes(newParachutes);
};


  useEffect(() => {
  if (!paused && !gameOver) {
    generateBirds();
    generateParachutes();
 generateStars();
  }

 const starInterval = setInterval(() => {
    if (!paused && !gameOver) {
      setStarsPosition(prevStars => {
        const updatedStars = prevStars.map(s => {
          let newTop = s.top + starSpeed;

          if (newTop > screenHeight) {
            newTop = -starHeight;
            s.left = Math.random() * (screenWidth - starWidth);
          }

          return { ...s, top: newTop };
        });

        // Ensure the stars array maintains the correct number
        if (updatedStars.length < numStars) {
          return [...updatedStars, ...Array(numStars - updatedStars.length).fill(0).map(() => ({
            left: Math.random() * (screenWidth - starWidth),
            top: -starHeight,
          }))];
        }
        
        return updatedStars;
      });
    }
  }, 50);

  const birdInterval = setInterval(() => {
    if (!paused && !gameOver) {
      setBirdPositions(prevPositions => {
        return prevPositions.map(pos => {
          let newLeft = pos.left;
          if (pos.direction === 'left') {
            newLeft -= birdSpeed;
          } else {
            newLeft += birdSpeed;
          }

          if (newLeft < -birdWidth || newLeft > screenWidth + birdWidth) {
            return {
              ...pos,
              left: pos.direction === 'left' ? screenWidth : -birdWidth,
              top: Math.floor(Math.random() * (screenHeight - birdHeight))
            };
          } else {
            return { ...pos, left: newLeft };
          }
        });
      });
    }
  }, 50);

  const cloudInterval = setInterval(() => {
    if (!paused) {
      setCloudsPosition(prevPositions => {
        return prevPositions.map(cloud => {
          let newLeft = cloud.left;

          if (cloud.direction === 'left') {
            newLeft -= 2;
          } else {
            newLeft += 2;
          }

          if (cloud.direction === 'left' && newLeft < -200) {
            newLeft = screenWidth + 200;
            cloud.top = Math.random() * (screenHeight - 100);
          } else if (cloud.direction === 'right' && newLeft > screenWidth + 200) {
            newLeft = -200;
            cloud.top = Math.random() * (screenHeight - 100);
          }

          return { ...cloud, left: newLeft };
        });
      });
    }
  }, 50);

  const parachuteInterval = setInterval(() => {
    if (!paused && !gameOver) {
      setParachutes(prevParachutes => {
        const updatedParachutes = prevParachutes.map(p => {
          let newTop = p.top + parachuteSpeed;

          if (newTop > screenHeight) {
            // Reset parachute to top of the screen
            newTop = -parachuteHeight;
            p.left = Math.random() * (screenWidth - parachuteWidth);
          }

          return { ...p, top: newTop };
        });

        // Ensure the parachutes array maintains the correct number
        if (updatedParachutes.length < numParachutes) {
          return [...updatedParachutes, ...Array(numParachutes - updatedParachutes.length).fill(0).map(() => ({
            left: Math.random() * (screenWidth - parachuteWidth),
            top: -parachuteHeight,
          }))];
        }
        
        return updatedParachutes;
      });
    }
  }, 50);

  return () => {
    clearInterval(birdInterval);
    clearInterval(cloudInterval);
    clearInterval(parachuteInterval);
clearInterval(starInterval);
  };
}, [screenWidth, screenHeight, paused, gameOver]);

  const moveAircraft = (direction) => {
    const moveDistance = 20;
    setPosition(prevPosition => {
      let newLeft = prevPosition.left;
      let newTop = prevPosition.top;

      if (direction === 'up' && newTop > 0) newTop -= moveDistance;
      if (direction === 'down' && newTop < screenHeight - aircraftHeight) newTop += moveDistance;
      if (direction === 'left' && newLeft > 0) newLeft -= moveDistance;
      if (direction === 'right' && newLeft < screenWidth - aircraftWidth) newLeft += moveDistance;

      return { left: newLeft, top: newTop };
    });
  };

  const checkCollision = () => {
  if (paused || gameOver) return;

  const aircraftLeft = position.left;
  const aircraftRight = position.left + aircraftWidth;
  const aircraftTop = position.top;
  const aircraftBottom = position.top + aircraftHeight;

// Check collision (striking) with stars
 starsPosition.forEach(star => {
    const starLeft = star.left;
    const starRight = star.left + starWidth;
    const starTop = star.top;
    const starBottom = star.top + starHeight;

    if (
      aircraftRight > starLeft &&
      aircraftLeft < starRight &&
      aircraftBottom > starTop &&
      aircraftTop < starBottom
    ) {
      setStars(prevStars => Math.min(prevStars + 1, 50));   //    increases the stars by 1
      setStarsPosition(prevStars => prevStars.filter(s => s !== star));
    }
  });

  // Check collision (striking) with birds
  birdPositions.forEach(bird => {
    const birdLeft = bird.left;
    const birdRight = bird.left + birdWidth;
    const birdTop = bird.top;
    const birdBottom = bird.top + birdHeight;

    if (
      aircraftRight > birdLeft &&
      aircraftLeft < birdRight &&
      aircraftBottom > birdTop &&
      aircraftTop < birdBottom
    ) {
      setGameOver(true);
    }
  });

  // Check collision (striking) with parachutes
  parachutes.forEach(p => {
    const parachuteLeft = p.left;
    const parachuteRight = p.left + parachuteWidth;
    const parachuteTop = p.top;
    const parachuteBottom = p.top + parachuteHeight;

    if (
      aircraftRight > parachuteLeft &&
      aircraftLeft < parachuteRight &&
      aircraftBottom > parachuteTop &&
      aircraftTop < parachuteBottom
    ) {

      setFuel(prevFuel => Math.min(prevFuel + 10, 50)); // Increase fuel by 10, max fuel is 20
      setParachutes(prevParachutes => prevParachutes.filter(pItem => pItem !== p));
    }
  });
};

  useEffect(() => {
    if (!paused && !gameOver) {
      checkCollision();
    }
  }, [position, birdPositions, parachutes]);

 


const [thankYouMessage, setThankYouMessage] = useState('');
  const handlePause = () => setPaused(prevPaused => !prevPaused);
  const handleRestart = () => setRestart(true);
  const handleCloseForm = () => setFormSubmitted(false);
const handleContinueClick = () => {
  resetGame(); // Restart the game every time Continue is clicked
  setThankYouMessage('');
  setFormSubmitted(false);
};
const resetGame = () => {
  setStars(0);         // Reset stars
  setTime(0);          // Reset time
  setFuel(10);         // Reset fuel
  setGameOver(false);  // Reset game over state
setPaused(false); // Ensure game is not paused
  setParachutes([]);   // Clear parachutes
  setStars([]); // Clear collected stars
};

// Handle form submission
const handleFormSubmit = async (event) => {
  event.preventDefault();
  const newEntry = { name, stars, time };

  // Update local ranking in case API fails
  const localRanking = JSON.parse(localStorage.getItem('ranking')) || [];
  const updatedRanking = [...localRanking, newEntry].sort((a, b) => {
    if (a.stars !== b.stars) return b.stars - a.stars;
    return a.time - b.time;
  });
  localStorage.setItem('ranking', JSON.stringify(updatedRanking));

  // Try to send the ranking to the server
  try {
    await axios.post('/https://your-server-url.com/submit', newEntry);
    setThankYouMessage('Thank you for playing!');
  } catch (error) {
    setThankYouMessage('Failed to submit score, saved locally.');
  }
  setFormSubmitted(true);
  setRanking(updatedRanking);
};
// Load ranking from API or fallback to local storage
// Load ranking from API or fallback to local storage
const loadRanking = async () => {
  setLoadingRanking(true); // Start loading the ranking
  try {
    const response = await axios.get('/https://your-server-url.com/ranking'); // API call to fetch the ranking
    setRanking(response.data); // Set ranking from the API
    setErrorFetchingRanking(false); // No error, API call successful
  } catch (error) {
    setErrorFetchingRanking(true); // Error occurred, fallback to local ranking
    const localRanking = JSON.parse(localStorage.getItem('ranking')) || [];
    setRanking(localRanking); // Set ranking from localStorage
  } finally {
    setLoadingRanking(false); // Stop loading
  }
};

// loadRanking on component mount
useEffect(() => {
  loadRanking();
}, []);

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
};


  return (
  <div className="green-screen">
    {gameOver && !formSubmitted ? (
      <div className="game-over">
    <div className="hud">
      <p>Game Over</p>
      <p>Your time: {formatTime(time)}</p>
      <p>Fuel left: {fuel}</p>
      <p>Stars collected: {stars}</p>
      <button onClick={handleRestart}>Restart</button>
    </div>
<div className="center-container">
    <div className="form-container">
      <form onSubmit={handleFormSubmit}>
        <label>
         Enter Your  Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
 <div className="button-container">
        <button type="submit">Submit</button> 
  <button onClick={handleContinueClick} className="button">Continue</button>
    </div>
      </form>
    </div>
</div>
  </div>
) : formSubmitted ? (
  <div className="thank-you">
    <p>Thank you for submitting your details!</p>
    <button onClick={handleCloseForm} className="button">Close</button>
    <div className="ranking ranking-container">
      <h2>Leaderboard</h2>
      <ul>
       <h3>Ranking</h3>
   {/* Loading state for ranking */}
    {loadingRanking ? (
      <p>Loading ranking...</p>
    ) : (
      <div className="ranking-table-container">
        {/* Error fetching from API - show local ranking message */}
        {errorFetchingRanking && (
          <p>Failed to load online ranking. Showing locally saved ranking.</p>
        )}
        
        {/* Display the ranking table */}
        {ranking && ranking.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Stars</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((entry, index) => (
                <tr key={index}>
                  <td>{index + 1}</td> {/* Rank */}
                  <td>{entry.name}</td> {/* Player Name */}
                  <td>{entry.stars}</td> {/* Stars Collected */}
                  <td>{formatTime(entry.time)}</td> {/* Time */}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No ranking data available.</p>
        )}
      </div>
    )}
      </ul>
    </div>
    <button onClick={handleContinueClick} className="button">Start Game</button>
  </div>
    ) : (
    <div className="game-screen">
        <div className="hud">
          <p>Time: {time} seconds</p>
          <p>Fuel: {fuel}</p>
          <p>Stars: {stars}</p>
          <button onClick={handlePause}>{paused ? "Resume" : "Pause"}</button>
          <button onClick={handleRestart}>Restart</button>
        </div>
        <img src={airplaneImage} className="aircraft" style={{ left: position.left, top: position.top }} alt="Aircraft" />
        {cloudsPosition.map((cloud, index) => (
          <img key={index} src={cloudImagee} className="cloud" style={{ left: cloud.left, top: cloud.top }} alt="Cloud" />
        ))}
        {birdPositions.map((bird, index) => (
          <img key={index} src={birdImage} className="bird" style={{ left: bird.left, top: bird.top }} alt="Bird" />
        ))}
        {parachutes.map((p, index) => (
          <img key={index} src={parachuteImage} className="parachute" style={{ left: p.left, top: p.top }} alt="Parachute" />
        ))}
{starsPosition.map((star, index) => (
    <img key={index} src={starImage} className="star" style={{ left: star.left, top: star.top }} alt="Star" />
  ))}
        {/*  arrow controlls to move the aircraft */}
        <div className="arrow-controls">
          <button onClick={() => moveAircraft('up')}>Up</button>
          <button onClick={() => moveAircraft('down')}>Down</button>
          <button onClick={() => moveAircraft('left')}>Left</button>
          <button onClick={() => moveAircraft('right')}>Right</button>
        </div>
      </div>
    )}
  </div>
);
}