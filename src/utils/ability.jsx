// ability.js
import { createContext } from "react";
import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export const AbilityContext = createContext();

export const defineAbilitiesForPermissions = (permissions) => {
  const { can, rules } = new AbilityBuilder(createMongoAbility);

  permissions.forEach((perm) => {
    const subject = perm.pageName;
    console.log("canView : " + perm.canView);
    console.log("canEdit : " + perm.canEdit);
    if (perm.canView) {
      can("view", subject);
    }
    if (perm.canEdit) {
      can("edit", subject);
    }
  });

  return createMongoAbility(rules);
};
