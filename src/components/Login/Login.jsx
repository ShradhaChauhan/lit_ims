import React, { useContext, useState, useEffect } from "react";
import "./Login.css";
import ims_logo from "../../assets/images/ims_logo.png";
import lit_logo from "../../assets/images/lit_logo.png";
import leftImg from "../../assets/images/img1.jpg";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import checklist from "../../assets/images/blackhole.gif";
import Cookies from "js-cookie";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localIp, setLocalIp] = React.useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [branch, setBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");
  const [responseUsername, setResponseUsername] = useState("");
  const {
    setIsAuthenticated,
    setRole,
    setIsToken,
    setPermissions,
    updatePermissions,
  } = useContext(AppContext);

  const handleVerify = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsAuthenticated(true);
    setError("");
    setError("");
    try {
      const response = await api.post("/api/auth/login", {
        username,
        password,
      });

      console.log("Verify Response:", response);

      if (response.data && response.data.data && response.data.data.branches) {
        setBranches(response.data.data.branches);
        setResponseUsername(response.data.data.username);
        setBranch(""); // Clear any previous branch selection
        Cookies.set("role", response.data.data.username, { expires: 1 }); // 1 day (matches backend expiry)
        setRole(response.data.data.username);
      } else {
        setError("No branches found for this user.");
      }
      console.log("Verify Response:", response);
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please try again.");
    }
  };

  // IP address
  function getLocalIP(callback) {
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel("");
    pc.onicecandidate = (event) => {
      if (!event || !event.candidate) return;
      const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
      const ipMatch = ipRegex.exec(event.candidate.candidate);
      if (ipMatch) {
        callback(ipMatch[1]);
        pc.close();
      }
    };
    pc.createOffer().then((offer) => pc.setLocalDescription(offer));
  }

  useEffect(() => {
    getLocalIP((ip) => setLocalIp(ip));
  }, []);

  const handleLogin = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setError("");

    if (!branch) {
      setError("Please select a branch.");
      return;
    }

    // Read lastVisitedRoute before removing cookies
    const lastVisitedRoute = Cookies.get("lastVisitedRoute");
    const logoutType = Cookies.get("logoutType");

    try {
      const response = await api.post("/api/auth/select-branch", {
        username: responseUsername,
        branchId: branch,
        localIp,
      });

      const { token, permissions } = response.data.data;
      console.log("Login Response:", response.data.data);

      // Clear only old session cookies, NOT lastVisitedRoute
      ["isLoggedIn", "username", "token", "authToken", "permissions"].forEach(
        (name) => Cookies.remove(name)
      );

      // Set essential session cookies
      Cookies.set("isLoggedIn", "true", { path: "/" });
      Cookies.set("username", responseUsername, { path: "/" });
      Cookies.set("token", token, { path: "/" });
      Cookies.set("authToken", token, { path: "/" });
      Cookies.set("permissions", JSON.stringify(permissions), {
        expires: 1,
        path: "/",
      });

      // rememberMe logic
      if (rememberMe) {
        Cookies.set("rememberedUsername", username, { expires: 7, path: "/" });
      } else {
        Cookies.remove("rememberedUsername", { path: "/" });
      }

      // Update states
      updatePermissions(permissions);
      setIsToken(token);
      setIsAuthenticated(true);
      setRole(responseUsername);
      setPermissions(permissions);

      toast.success("Login successful");

      // Navigate to last visited route if auto-logout, otherwise dashboard
      if (logoutType === "auto" && lastVisitedRoute) {
        navigate(lastVisitedRoute);
      } else {
        token && navigate("/dashboard");
      }

      // Cleanup logout cookies after redirect
      Cookies.remove("logoutType", { path: "/" });
      Cookies.remove("lastVisitedRoute", { path: "/" });
    } catch (err) {
      setIsAuthenticated(false);
      console.error(err);
      setError("Login failed. Please contact support.");
    }
  };

  const isBranchSelection = branches.length > 0;

  // // Load stored username on mount
  useEffect(() => {
    // const savedUsername = localStorage.getItem("rememberedUsername");
    const savedUsername = Cookies.get("rememberedUsername");

    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  // Auto refresh page on first load
  useEffect(() => {
    const hasRefreshed = sessionStorage.getItem("loginPageRefreshed");

    if (!hasRefreshed) {
      sessionStorage.setItem("loginPageRefreshed", "true");
      window.location.reload(); // refresh once
    }
  }, []);

  return (
    <div className="container-fluid container-bg min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row shadow-lg login-container bg-white rounded-4 overflow-hidden">
        {/* Left Panel */}
        <div className="col-md-6 p-5 login-box">
          <div className="text-center mb-4">
            <img
              src={checklist}
              alt="Img"
              width={60}
              height={60}
              className="d-block mx-auto mb-3 jump-in"
            />
            <h2 className="fw-semibold mb-3 text-fade-in">
              Welcome Back to IMS
            </h2>
            <p className="tmb-4 description-font text-fade-in">
              Enter your username and password to access your account.
            </p>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}

          <form>
            {!isBranchSelection ? (
              <>
                <div
                  className="form-section fade-in-up"
                  style={{ animationDelay: "0.1s" }}
                >
                  <label htmlFor="username" className="form-label">
                    Username/Email
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user position-absolute input-i"></i>
                    <input
                      type="text"
                      className="form-control text-font ps-5"
                      id="username"
                      placeholder="Enter username or email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div
                  className="form-section fade-in-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-lock position-absolute input-i"></i>
                    <input
                      type="password"
                      className="form-control text-font ps-5"
                      id="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div
                  className="form-check fade-in-up"
                  style={{ animationDelay: "0.3s" }}
                >
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember Me
                  </label>
                </div>

                <button
                  type="submit"
                  onClick={handleVerify}
                  className="btn loginBtn w-100 mt-4 fade-in-up"
                  style={{ animationDelay: "0.4s" }}
                >
                  Verify
                </button>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <label className="form-label">Select Branch</label>
                  <select
                    className="form-select text-color-gray text-8"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  >
                    <option value="">-- Select Branch --</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  onClick={handleLogin}
                  className="btn loginBtn w-100 mt-3 mb-5"
                >
                  Login
                </button>
              </>
            )}
          </form>

          <div
            className="mt-5 text-center text-muted"
            style={{ fontSize: "0.75rem" }}
          >
            © 2025 LIT India Pvt. Ltd.
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-md-6 d-none d-md-flex flex-column align-items-center justify-content-center text-white p-5 bg-blue">
          <div className="mb-4">
            <img
              src={ims_logo}
              width={110}
              height={110}
              alt="IMS logo"
              className="logo-style text-fade-in"
            />
          </div>
          <div className="text-center mt-5">
            <h4 className="fw-bold mb-3 text-fade-in">
              Effortlessly manage your inventory and reports.
            </h4>
            <p className="small mb-4 text-fade-in">
              Log in to access your IMS dashboard and manage your inventory.
            </p>
          </div>
          <div className="container">
            <div className="box">Manage Suppliers and Purchase Orders</div>
            <div className="box">Generate Reports and Analytics</div>
            <div className="box">Set Reorder Alerts and Thresholds</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
