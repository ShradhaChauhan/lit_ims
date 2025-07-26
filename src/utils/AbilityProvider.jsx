// AbilityProvider.js
import React from "react";
import { defineAbilitiesForPermissions } from "../utils/defineAbilitiesForPermissions";
import { AbilityContext } from "../utils/AbilityContext";

export const AbilityProvider = ({ permissions, children }) => {
  const ability = defineAbilitiesForPermissions(permissions);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};
