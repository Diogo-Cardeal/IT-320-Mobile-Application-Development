import React, { useState } from "react";
import "./App.css";

function App() {

  // State that stores the list of notes
  const [notes, setNotes] = useState([]);

  // State that stores the current text in the input
  const [input, setInput] = useState("");

  // Function to add a new note
  function addNote() {

    // Prevent adding empty notes
    if (input.trim() === "") {
      return;
    }

    // Add new note to the array
    setNotes([...notes, input]);

    // Clear the input box
    setInput("");
  }

  // Function to remove a note
  function removeNote(index) {

    // Create a copy of notes
    const newNotes = [...notes];

    // Remove the selected note
    newNotes.splice(index, 1);

    // Update state
    setNotes(newNotes);
  }

  return (
    <div className="App">

      {/* Title of the application */}
      <h1>My Notes App</h1>

      {/* Input field */}
      <input
        type="text"
        placeholder="Write a note..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {/* Button to add note */}
      <button onClick={addNote}>Add Note</button>

      {/* Total notes */}
      <h3>Total Notes: {notes.length}</h3>

      {/* List of notes */}
      <ul>
        {notes.map((note, index) => (
          <li key={index}>
            {note}

            {/* Remove button */}
            <button onClick={() => removeNote(index)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

    </div>
  );
}

export default App;