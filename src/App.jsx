import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login/Login'
import { Routes, Route } from "react-router-dom";
import Dashboard from './components/Dashboard/Dashboard';

function App() {

  return (
    <>
        <Routes>
          <Route exact path='/' element={ <Login /> } />
          <Route exact path='/dashboard' element={ <Dashboard /> } />
        </Routes>
    </>
  )
}

export default App
