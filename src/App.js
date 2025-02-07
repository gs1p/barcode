import React, { useState } from "react"; 
import "./App.css";

function App() {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("https://script.google.com/macros/s/AKfycbxc3Z_ZB6aNlhHwQMBAm_h5sKWwkbK7gHUbjFkppDd5H0L59_h84Dww7Y8y_uYbCkS89w/exec", {
      method: "POST",
      mode: "no-cors", // Bypasses CORS but prevents reading response
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    alert("Name submitted! Check your Google Sheet.");
    setName(""); // Clear input field after submission
  };

  return (
    <div className="container">
      <h1>Google Sheets Form</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
