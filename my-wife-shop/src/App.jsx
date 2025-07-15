import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import CheckoutPage from './components/CheckoutPage';


function App() {
    return(
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/CheckoutPage" element={<CheckoutPage/>}/>
      </Routes>
    )
}

export default App
