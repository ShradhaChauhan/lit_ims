import React from 'react'
import litWhiteLogo from '../../assets/images/litWhiteLogo.png'
import leftPanelImage from '../../assets/images/leftPanelImage.png'
import { useNavigate } from 'react-router-dom'
import './Login.css';

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/dashboard');
    }
  return (    
        <div className="container-fluid min-vh-100 d-flex p-5 wrapper">

            {/* Left Panel */}
                <div className="col-md-6 d-none d-md-flex flex-column text-white bg-primary p-5 leftPanel">
                    <img src={litWhiteLogo} width={110} height={110} alt="LIT logo" className="img-fluid mt-4 pt-4 position-absolute top-0 left-0" />
                    <p className="fs-4 textAlign text-center">
                        Where Innovation, Quality & You Converge
                    </p>
                    <div className='container-fluid'>
                         <img className='leftPanelImg' src={leftPanelImage} />
                    </div>
                    
                </div>
        
            {/* Right Panel */}
            <div className="col-md-6 d-flex align-items-center justify-content-center rightPanel">
                <div className="w-60">
                    <h2 className="">Login to your account</h2>
                    <p className='mb-4 description'>Monitor inventory levels and streamline operations</p>
                    <form>
                        <div className="mb-3">
                        {/* <label htmlFor="username" className="form-label">Username</label> */}
                        <input type="text" className="form-control" id="username" placeholder='Username' />
                        </div>
                        <div className="mb-3">
                        {/* <label htmlFor="password" className="form-label">password</label> */}
                        <input type="password" className="form-control" id="password" placeholder="Password" />
                        </div>
                        <div className="form-check mb-4">
                        <input type="checkbox" className="form-check-input" id="rememberMe" />
                        <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                        </div>
                        <button type="submit" onClick={handleLogin} className="btn loginBtn w-100">login</button>
                    </form>
                </div>
            </div>
        </div>    
  )
}

export default Login
