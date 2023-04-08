
import "./GolfScorecard.css";
import { format } from 'date-fns';
import React, { useState, useEffect } from "react";
import {  db } from './firebase';





const holeInfo = [
  { hole: 1, par: 4, handicap: 5 },
  { hole: 2, par: 3, handicap: 11 },
  { hole: 3, par: 5, handicap: 7 },
  { hole: 4, par: 4, handicap: 1 },
  { hole: 5, par: 4, handicap: 9 },
  { hole: 6, par: 5, handicap: 13 },
  { hole: 7, par: 3, handicap: 17 },
  { hole: 8, par: 4, handicap: 15 },
  { hole: 9, par: 4, handicap: 3 },
  { hole: 10, par: 4, handicap: 8 },
  { hole: 11, par: 4, handicap: 4 },
  { hole: 12, par: 3, handicap: 14 },
  { hole: 13, par: 4, handicap: 12 },
  { hole: 14, par: 4, handicap: 10 },
  { hole: 15, par: 4, handicap: 2 },
  { hole: 16, par: 5, handicap: 16 },
  { hole: 17, par: 3, handicap: 18 },
  { hole: 18, par: 5, handicap: 6 },
];


const GolfScorecard = () => {

  const [inputValues, setInputValues] = useState(() => {
    return scores.map(playerScores =>
      playerScores.map(score => (score === '' ? '' : String(score))),
    );
  });
  
  const handleInputChange = (playerIndex, holeIndex, value) => {
    const newInputValues = [...inputValues];
    newInputValues[playerIndex][holeIndex] = value;
    setInputValues(newInputValues);
  
    const parsedValue = parseInt(value);
    if (!isNaN(parsedValue)) {
      updateScore(playerIndex, holeIndex, parsedValue);
    } else {
      updateScore(playerIndex, holeIndex, '');
    }
  };
  

  const saveStateToLocalStorage = () => {
    localStorage.setItem("playerNames", JSON.stringify(playerNames));
    localStorage.setItem("playerHandicaps", JSON.stringify(playerHandicaps));
    localStorage.setItem("scores", JSON.stringify(scores));
  };
  
  const fetchRounds = async () => {
    try {
      const snapshot = await db.collection("rounds").get();
      const fetchedRounds = snapshot.docs.map((doc) => doc.data());
      setRounds(fetchedRounds);
    } catch (error) {
      console.error("Error fetching rounds: ", error);
    }
  };
  
  
  const [buyIn, setBuyIn] = useState(10);
  const [isBuyInPopupVisible, setIsBuyInPopupVisible] = useState(false);
  const changeBuyIn = (newBuyIn) => {
    setBuyIn(newBuyIn);
  };
  const toggleBuyInPopup = () => {
    setIsBuyInPopupVisible(!isBuyInPopupVisible);
  };



  const getStrokeIndex = (playerIndex, holeIndex) => {
    const playerHandicap = playerHandicaps[playerIndex];
    const holeHandicap = holeInfo[holeIndex].handicap;
    return playerHandicap >= holeHandicap ? 1 : 0;
  };
  
  
  


  const addPlayerWithHandicap = () => {
    const playerName = prompt("Please enter the player's name.");
    if (playerName === null || playerName.trim() === "") {
      alert("Invalid name entered. Please enter a valid name.");
      return;
    }
    const handicap = parseInt(prompt("Please enter the player's handicap."));
    if (isNaN(handicap)) {
      alert("Invalid handicap entered. Please enter a valid number.");
    } else {
      addPlayer(playerName, handicap);
      saveStateToLocalStorage();
    }
  };
 

  const handleHandicapChange = (index, newHandicap) => {
  const newPlayerHandicaps = [...playerHandicaps];
  newPlayerHandicaps[index] = newHandicap;
  setPlayerHandicaps(newPlayerHandicaps);
};

  const [skinsResult, setSkinsResult] = useState(null);

  const calculateSkins = () => {
    const skins = [];
    let carryOver = 0;
    const buyIn = 10;
    const totalSkins = playerNames.length * buyIn;
  
    holeInfo.forEach((hole, holeIndex) => {
      const lowestNetScorePlayerIndex = getLowestNetScorePlayerIndex(holeIndex);
  
      if (lowestNetScorePlayerIndex !== null) {
        skins.push({
          hole: hole.hole,
          playerIndex: lowestNetScorePlayerIndex,
          value: 1 + carryOver,
        });
        carryOver = 0;
      } else {
        carryOver++;
      }
    });
  
    const playerSkins = Array(playerNames.length).fill(0);
    skins.forEach((skin) => {
      playerSkins[skin.playerIndex] += skin.value;
    });
  
    const payout = playerSkins.map((skinsWon) => (skinsWon * totalSkins) / holeInfo.length);
  
    setSkinsResult({ skins, playerSkins, payout });
  };
  
  const getLowestNetScorePlayerIndex = (holeIndex) => {
    let lowestNetScore = Infinity;
    let lowestNetScorePlayerIndex = null;
    let numLowestNetScores = 0;
  
    for (let i = 0; i < playerNames.length; i++) {
      const playerScore = scores[i][holeIndex];
      const playerHandicap = playerHandicaps[i];
      const holeHandicap = holeInfo[holeIndex].handicap;
      const netScore = playerScore !== "" ? parseInt(playerScore) - (playerHandicap >= holeHandicap ? 1 : 0) : null;
  
      if (netScore !== null && netScore < lowestNetScore) {
        lowestNetScore = netScore;
        lowestNetScorePlayerIndex = i;
        numLowestNetScores = 1;
      } else if (netScore !== null && netScore === lowestNetScore) {
        numLowestNetScores++;
      }
    }
  
    return numLowestNetScores === 1 ? lowestNetScorePlayerIndex : null;
  };
  

  const deletePlayer = (playerIndex) => {
    if (window.confirm("Are you sure you want to delete this player?")) {
      const newPlayerNames = [...playerNames];
      newPlayerNames.splice(playerIndex, 1);
      setPlayerNames(newPlayerNames);
      saveStateToLocalStorage();

      const newScores = [...scores];
      newScores.splice(playerIndex, 1);
      setScores(newScores);
      saveStateToLocalStorage();
    }
  };
  const saveRound = () => {
    const newRounds = [
      ...rounds,
      {
        scores: [scores],
        players: [...playerNames],
        date: new Date(),
      },
    ];
    setRounds(newRounds);
    localStorage.setItem("rounds", JSON.stringify(newRounds));
  };

  


  const handlePlayerNameChange = (index, newName) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = newName;
    setPlayerNames(newPlayerNames);
  };

  const [playerNames, setPlayerNames] = useState(() => {
    const storedPlayerNames = localStorage.getItem("playerNames");
    return storedPlayerNames ? JSON.parse(storedPlayerNames) : [];
  });
  
  const [playerHandicaps, setPlayerHandicaps] = useState(() => {
    const storedPlayerHandicaps = localStorage.getItem("playerHandicaps");
    return storedPlayerHandicaps ? JSON.parse(storedPlayerHandicaps) : [];
  });
  
  const [scores, setScores] = useState(() => {
    const storedScores = localStorage.getItem("scores");
    return storedScores
      ? JSON.parse(storedScores)
      : Array(playerNames.length).fill(Array(holeInfo.length).fill(""));
  });
  
  

  const editPlayer = (playerIndex) => {
    const playerName = prompt("Please enter the new player's name.", playerNames[playerIndex]);
    if (playerName === null || playerName.trim() === "") {
      alert("Invalid name entered. Please enter a valid name.");
      return;
    }
  
    const handicap = parseInt(prompt("Please enter the new player's handicap.", playerHandicaps[playerIndex]));
    if (isNaN(handicap)) {
      alert("Invalid handicap entered. Please enter a valid number.");
    } else {
      handlePlayerNameChange(playerIndex, playerName);
      handleHandicapChange(playerIndex, handicap);
    }
  };
  

  const updateScore = (playerIndex, holeIndex, score) => {
    const newScores = [...scores];
    newScores[playerIndex][holeIndex] = score;
    setScores(newScores);
  };

  const addPlayer = (playerName, handicap) => {
    const newPlayerNames = [...playerNames, playerName];
    const newScores = [...scores, Array(holeInfo.length).fill("")];
    const newPlayerHandicaps = [...playerHandicaps, handicap];
    setPlayerNames(newPlayerNames);
    setScores(newScores);
    setPlayerHandicaps(newPlayerHandicaps);
    saveStateToLocalStorage();
  };


  const [rounds, setRounds] = useState(() => {
    const storedRounds = localStorage.getItem("rounds");
    return storedRounds ? JSON.parse(storedRounds) : [];
  });
  
  useEffect(() => {
    fetchRounds();
  }, []);

  const deleteRound = async (index) => {
    if (window.confirm("Are you sure you want to delete this round?")) {
      const roundToDelete = rounds[index];
      try {
        await db.collection("rounds").doc(roundToDelete.id).delete();
        fetchRounds();
      } catch (error) {
        console.error("Error removing round: ", error);
      }
    }
  };

  const addRound = async () => {
    const newRound = {
      score: 0,
      date: new Date().toISOString(),
    };

    try {
      await db.collection("rounds").add(newRound);
      fetchRounds();
    } catch (error) {
      console.error("Error adding new round: ", error);
    }
  };

  const updateRound = async (index, updatedScore) => {
    const roundToUpdate = rounds[index];
    try {
      await db.collection("rounds").doc(roundToUpdate.id).update({
        score: updatedScore,
      });
      fetchRounds();
    } catch (error) {
      console.error("Error updating round: ", error);
    }
  };

    
    
  

  const getCellClassName = (playerIndex, holeIndex) => {
    const lowestNetScorePlayerIndex = getLowestNetScorePlayerIndex(holeIndex);
    const strokeIndex = getStrokeIndex(playerIndex, holeIndex);
    let cellClass = "cell score";
    if (playerIndex === lowestNetScorePlayerIndex) {
      cellClass += " lowest";
    }
    if (strokeIndex > 0) {
      cellClass += " stroke";
    }
    return cellClass;
  };
   
  
  

  return (
    <div className="scorecard">
         
      







      <div className="header">
        <div className="cell player-name"></div>
        {holeInfo.map((hole) => (
          <div key={hole.hole} className="cell">
            <div> {hole.hole}</div>
            <div>Par {hole.par}</div>
            <div>H: {hole.handicap}</div>
          </div>
        ))}
        <div className="cell total">Total</div>
      </div>

       
            {playerNames.length === 0 && (
        <div className="no-players">No players added. Click "Add Player" to start.</div>
      )}

      {playerNames.map((playerName, playerIndex) => (
        <div key={playerIndex} className="body">
          <div className="cell player-name">
            <button onClick={() => deletePlayer(playerIndex)}>Delete</button>
            <span onClick={() => editPlayer(playerIndex)}>
              {playerName}
              <span className="handicap">H: {playerHandicaps[playerIndex]}</span>
            </span>
          </div>


    {scores[playerIndex].map((score, holeIndex) => (
      <div key={holeIndex} className={getCellClassName(playerIndex, holeIndex)}>
<input
  type="number"
  value={inputValues[playerIndex][holeIndex]}
  onChange={(e) => handleInputChange(playerIndex, holeIndex, e.target.value)}
/>
      </div>
    ))}
    <div className="cell total">
      {scores[playerIndex].reduce(
        (acc, cur) => (cur === "" ? acc : acc + parseInt(cur)),
        0
      )}
    </div>
  </div>
))}

<div className="add-player-button">
    <button className="button-style" onClick={addPlayerWithHandicap}>
      Add Player
    </button>
  </div>


<div className="footer">
{isBuyInPopupVisible && (
    <div className="buy-in-popup">
      <h3>Change Buy-in</h3>
      <input
        type="number"
        value={buyIn}
        onChange={(e) => changeBuyIn(parseInt(e.target.value))}
      />
      <button onClick={toggleBuyInPopup}>Save</button>
    </div>
  )}

  <div className="button-container">
    <button className="button-style" onClick={calculateSkins}>
      Calculate Skins
    </button>
    <button className="button-style" onClick={toggleBuyInPopup}>
      Change Buy-in
    </button>
    <button className="button-style" onClick={saveRound}>
      Save Round
    </button>
  </div>
</div>

    {skinsResult && (
  <div className="skins-result">
    <h2>Skins Results</h2>
    <ul>
      {playerNames.map((playerName, playerIndex) => (
        <li key={playerIndex}>
          {playerName}: {skinsResult.playerSkins[playerIndex]} skins (${skinsResult.payout[playerIndex].toFixed(2)})
        </li>
      ))}
    </ul>
  </div>
)}

<div className="rounds-table">
        <table>
          <thead>
            <tr>
              <th>Round Date</th>
              {playerNames.map((playerName, i) => (
                <th key={i}>Player {i + 1}</th>
              ))}
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((round, index) => (
              <tr key={index}>
                <td>{format(round.date, 'yyyy-MM-dd')}</td>
                {round.scores.map((score, i) => (
                  <td key={i}>{score}</td>
                ))}
                <td>
                  <button onClick={() => deleteRound(index)}>Delete</button>
                </td>
                <td>
                  <button
                    onClick={() =>
                      updateRound(index, prompt('Enter the updated score:'))
                    }
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="button-style" onClick={addRound}>
          Add Round
        </button>
      </div>
    </div>
  );
};

export default GolfScorecard;