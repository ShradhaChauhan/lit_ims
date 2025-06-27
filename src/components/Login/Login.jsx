import React, { useState } from "react";
import litWhiteLogo from "../../assets/images/litWhiteLogo.png";
import leftPanelImage from "../../assets/images/leftPanelImage.png";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import api from "../../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("/api/auth/login", {
        username,
        password,
      });

      console.log(response);

      const branches = response.data.branches;
      if (branches && branches.length > 0) {
        setBranches(branches);
      } else {
        setError("No branches found for this user.");
      }
    } catch (err) {
      setError("Invalid Credentials");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!branch) {
      setError("Please select a branch.");
      return;
    }

    try {
      const response = await api.post(
        `/api/auth/select-branch?username=${username}&branchId=${branch}`
      );

      console.log(response);
      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Please contact support.");
    }
  };

  const isVerifying = branches.length === 0;

  return (
    <div className="container-fluid min-vh-100 d-flex p-5 wrapper">
      {/* Left Panel */}
      <div className="col-md-6 d-none d-md-flex flex-column text-white bg-primary p-5 leftPanel">
        <img
          src={litWhiteLogo}
          width={110}
          height={110}
          alt="LIT logo"
          className="img-fluid mt-4 pt-4 position-absolute top-0 left-0"
        />
        <h1 className="text-center margin-top-10">IMS</h1>
        <p className="fs-4 textAlign text-center">
          Where Innovation, Quality & You Converge
        </p>
        <div className="container-fluid">
          <img className="leftPanelImg" src={leftPanelImage} alt="Left Panel" />
        </div>
      </div>

      {/* Right Panel */}
      <div className="col-md-6 d-flex align-items-center justify-content-center rightPanel">
        <div className="w-60">
          <h2>Login to your account</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form className="mt-4">
            {isVerifying ? (
              <>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control text-color-gray"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control text-color-gray"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </>
            ) : (
              <div className="mb-3">
                <select
                  className="form-select text-color-gray"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-check mb-4">
              <input
                type="checkbox"
                className="form-check-input"
                id="rememberMe"
              />
              <label className="form-check-label" htmlFor="rememberMe">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              onClick={isVerifying ? handleVerify : handleLogin}
              className="btn loginBtn w-100"
            >
              {isVerifying ? "Verify" : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
