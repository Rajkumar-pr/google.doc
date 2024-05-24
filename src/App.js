import React from 'react'

import Home from './Home'
import LoginSignupPage from './LoginSignupPage'
import Editor from './Editor'
import {BrowserRouter,Routes,Route} from "react-router-dom"
function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path='/' Component={Home}/>
        <Route path='/login' Component={ LoginSignupPage}/>
        <Route path='/editor' Component={Editor}/>
        </Routes></BrowserRouter>
     
    </div>
  )
}

export default App
