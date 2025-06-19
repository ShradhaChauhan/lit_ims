import React, { useState } from 'react';
import litWhiteLogo from '../../assets/images/litWhiteLogo.png';
import leftPanelImage from '../../assets/images/leftPanelImage.png';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import api from '../../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/login', {
                username,
                password,
            });
            
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid Credentials');
        }
    };

    return (
        <div className="container-fluid min-vh-100 d-flex p-5 wrapper">
            {/* Left Panel */}
            <div className="col-md-6 d-none d-md-flex flex-column text-white bg-primary p-5 leftPanel">
                <img src={litWhiteLogo} width={110} height={110} alt="LIT logo" className="img-fluid mt-4 pt-4 position-absolute top-0 left-0" />
                <p className="fs-4 textAlign text-center">
                    Where Innovation, Quality & You Converge
                </p>
                <div className='container-fluid'>
                    <img className='leftPanelImg' src={leftPanelImage} alt="Left Panel" />
                </div>
            </div>

            {/* Right Panel */}
            <div className="col-md-6 d-flex align-items-center justify-content-center rightPanel">
                <div className="w-60">
                    <h2 className="">Login to your account</h2>
                    <p className='mb-4 description'>Monitor inventory levels and streamline operations</p>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form>
                        <div className="mb-3">
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder='Username'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <input 
                                type="password" 
                                className="form-control" 
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="form-check mb-4">
                            <input type="checkbox" className="form-check-input" id="rememberMe" />
                            <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                        </div>
                        <button type="submit" onClick={handleLogin} className="btn loginBtn w-100">Login</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
