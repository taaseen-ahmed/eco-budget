import React from 'react';
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import HelloTest from './components/HelloTest';  // Import the HelloTest component

function App() {
  return (
      <Router>
        <div className="App">
          <header className="App-header">
            <h1>Eco-Budget App</h1>
            <p>Welcome to the Eco-Budget application.</p>

            {/* Define Routes */}
            <Routes>
              <Route path="/" element={<div>Home Page</div>} />
              <Route path="/hello-test" element={<HelloTest />} /> {/* Add the route for HelloTest */}
            </Routes>
          </header>
        </div>
      </Router>
  );
}

export default App;