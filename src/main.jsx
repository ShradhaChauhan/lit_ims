import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css?v=1.2";
import App from "./App.jsx";
import AppContextProvider from "./context/AppContext.jsx";
import { AbilityProvider } from "./utils/AbilityProvider"; // your created file
// import { getUserPermissions } from "./utils/auth"; // assume it returns the permission array from localStorage or API

const userData = JSON.parse(localStorage.getItem("permissions") || "{}");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppContextProvider>
      <BrowserRouter>
        <AbilityProvider permissions={userData || []}>
          <App />
        </AbilityProvider>
      </BrowserRouter>
    </AppContextProvider>
  </StrictMode>
);
