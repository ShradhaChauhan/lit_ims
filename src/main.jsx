import { StrictMode, useContext } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css?v=1.2";
import App from "./App.jsx";
import AppContextProvider, { AppContext } from "./context/AppContext.jsx";
import { AbilityProvider } from "./utils/AbilityProvider";

// NEW COMPONENT to read permissions from context
const AppWithAbility = () => {
  const { permissions } = useContext(AppContext);
  return (
    <AbilityProvider permissions={permissions}>
      <App />
    </AbilityProvider>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppContextProvider>
      <BrowserRouter>
        <AppWithAbility /> {/* dynamic permissions */}
      </BrowserRouter>
    </AppContextProvider>
  </StrictMode>
);
