import React, { useContext, useState } from "react";
import "./Login.css";
import ims_logo from "../../assets/images/ims_logo.png";
import lit_logo from "../../assets/images/lit_logo.png";
import leftImg from "../../assets/images/leftImg2.png";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { AppContext } from "../../context/AppContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");
  const [responseUsername, setResponseUsername] = useState("");
  const { setIsAuthenticated } = useContext(AppContext);

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

      if (response.data && response.data.branches) {
        setBranches(response.data.branches);
        setResponseUsername(response.data.username);
        setBranch(""); // Clear any previous branch selection
      } else {
        setError("No branches found for this user.");
      }
      console.log("Verify Response:", response);

      if (response.data && response.data.branches) {
        setBranches(response.data.branches);
        setResponseUsername(response.data.username);
        setBranch(""); // Clear any previous branch selection
      } else {
        setError("No branches found for this user.");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please try again.");
      console.error(err);
      setError("Invalid credentials. Please try again.");
    }
  };

  const handleLogin = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setError("");
    if (!branch) {
      setError("Please select a branch.");
      return;
    }
    try {
      const response = await api.post("/api/auth/select-branch", null, {
        params: {
          username: responseUsername,
          branchId: branch,
        },
      });

      console.log("Login Response:", response);
      // setIsAuthenticated(true);
      // Navigate to dashboard after successful login
      navigate("/dashboard");

      console.log("Login Response:", response);

      // ✅ Navigate to dashboard after successful login
      navigate("/dashboard");
    } catch (err) {
      setIsAuthenticated(false);
      console.error(err);
      console.error(err);
      setError("Login failed. Please contact support.");
    }
  };

  const isBranchSelection = branches.length > 0;

  return (
    <div className="container-fluid container-bg min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row shadow-lg login-container bg-white rounded-4 overflow-hidden">
        {/* Left Panel */}
        <div className="col-md-6 p-5">
          <img src={lit_logo} alt="LIT logo" width={90} height={90} />
          <h2 className="fw-semibold mb-3">Welcome Back !</h2>
          <p className="tmb-4 description-font">
            Enter your username and password to access your account.
          </p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form>
            {!isBranchSelection ? (
              <>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    type="text"
                    className="form-control text-color-gray"
                    id="username"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control text-color-gray"
                    id="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember Me
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  onClick={handleVerify}
                  className="btn btn-primary w-100 mt-3 mb-5"
                >
                  Verify
                </button>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <label className="form-label">Select Branch</label>
                  <select
                    className="form-select text-color-gray"
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
                  className="btn btn-primary w-100 mt-3 mb-5"
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
        <div className="col-md-6 d-none d-md-flex flex-column align-items-center justify-content-center text-white p-5 bg-primary">
          <div className="mb-4">
            <img src={ims_logo} width={110} height={110} alt="IMS logo" />
          </div>
          <div className="text-center">
            <h4 className="fw-bold mb-3">
              Effortlessly manage your inventory and reports.
            </h4>
            <p className="small mb-4">
              Log in to access your IMS dashboard and manage your inventory.
            </p>
            <img
              src={leftImg}
              alt="IMS Visual"
              className="img-fluid shadow left-image-border"
              width={430}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

// import React, { useState } from "react";
// import litWhiteLogo from "../../assets/images/litWhiteLogo.png";
// import leftPanelImage from "../../assets/images/leftPanelImage.png";
// import { useNavigate } from "react-router-dom";
// import "./Login.css";
// import api from "../../services/api";

// const Login = () => {
//   const navigate = useNavigate();
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [branch, setBranch] = useState("");
//   const [error, setError] = useState("");
//   const [responseUsername, setResponseUsername] = useState("");

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     try {
//       const data = { username, password };
//       console.log(data);
//       const response = await api.post("/api/auth/login", {
//         data,
//       });
//       console.log(response);
//       setBranch(response.branches);
//       setResponseUsername(response.username);
//       setLoginBtnFun(handleLogin);
//     } catch (err) {
//       setError("Invalid Credentials");
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const data = { username, password, branch };
//       console.log(data);
//       const response = await api.post("/api/auth/login", {
//         data,
//       });
//       console.log(response);
//       setLoginBtnFun(handleLogin);
//     } catch (err) {
//       setError(
//         "Some error occured while logging in. Please contact the support team"
//       );
//     }
//   };

//   const [loginBtnFun, setLoginBtnFun] = useState(handleVerify);
//   return (
//     <div className="container-fluid min-vh-100 d-flex p-5 wrapper">
//       {/* Left Panel */}
//       <div className="col-md-6 d-none d-md-flex flex-column text-white bg-primary p-5 leftPanel">
//         <img
//           src={litWhiteLogo}
//           width={110}
//           height={110}
//           alt="LIT logo"
//           className="img-fluid mt-4 pt-4 position-absolute top-0 left-0"
//         />

//         <h1 className="text-center margin-top-10">IMS</h1>
//         <p className="fs-4 textAlign text-center">
//           Where Innovation, Quality & You Converge
//         </p>
//         <div className="container-fluid">
//           <img className="leftPanelImg" src={leftPanelImage} alt="Left Panel" />
//         </div>
//       </div>

//       {/* Right Panel */}
//       <div className="col-md-6 d-flex align-items-center justify-content-center rightPanel">
//         <div className="w-60">
//           <h2 className="">Login to your account</h2>
//           {/* <p className="mb-4 description">
//             Monitor inventory levels and streamline operations
//           </p> */}
//           {error && <div className="alert alert-danger">{error}</div>}
//           <form className="mt-4">
//             {!branch ? (
//               <div>
//                 <div className="mb-3">
//                   <input
//                     type="text"
//                     className="form-control text-color-gray"
//                     placeholder="Username"
//                     value={username}
//                     onChange={(e) => setUsername(e.target.value)}
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <input
//                     type="password"
//                     className="form-control text-color-gray"
//                     placeholder="Password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                   />
//                 </div>
//               </div>
//             ) : (
//               <div className="dropdown mb-3">
//                 <select
//                   className="form-select text-color-gray"
//                   aria-label="Branch"
//                   defaultValue=""
//                 >
//                   <option value="">Select branch</option>
//                   <option value="1">IQC</option>
//                   <option value="2">Production</option>
//                 </select>
//               </div>
//             )}
//             {/* <div className="dropdown mb-3">
//               <select
//                 className="form-select text-color-gray"
//                 aria-label="Database"
//               >
//                 <option selected>Select database</option>
//                 <option value="1">A.124</option>
//                 <option value="2">A.250</option>
//               </select>
//             </div> */}
//             <div className="form-check mb-4">
//               <input
//                 type="checkbox"
//                 className="form-check-input"
//                 id="rememberMe"
//               />
//               <label className="form-check-label" htmlFor="rememberMe">
//                 Remember me
//               </label>
//             </div>
//             <button
//               type="submit"
//               onClick={loginBtnFun}
//               className="btn loginBtn w-100"
//             >
//               {branch ? "Login" : "Verify"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
