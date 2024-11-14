import React from 'react';
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import Home from './components/Home';  // Import Home component
import HelloTest from './components/HelloTest';  // Import HelloTest component
import Registration from './components/registration';
import Login from './components/Login';

function App() {
    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <h1>Eco-Budget</h1>
                </header>
                {/* Define Routes */}
                <Routes>
                    <Route path="/" element={<Home />} />  {/* Homepage route */}
                    <Route path="/hello-test" element={<HelloTest />} />  {/* API Test route */}
                    <Route path="/register" element={<Registration />} />  {/* Registration route */}
                    <Route path="/login" element={<Login />} />
                </Routes>
            </div>
        </Router>
    );
}


export default App;