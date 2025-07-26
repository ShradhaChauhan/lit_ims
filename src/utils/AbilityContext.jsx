// src/ability/AbilityContext.js
import React, { createContext, useContext } from "react";
import { createContextualCan } from "@casl/react";
import { createMongoAbility } from "@casl/ability";

export const AbilityContext = createContext();
export const useAbility = () => useContext(AbilityContext);
export const Can = createContextualCan(AbilityContext.Consumer);

export const defaultAbility = createMongoAbility([]);
