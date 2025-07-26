// src/ability/defineAbilitiesForPermissions.js
import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export function defineAbilitiesForPermissions(permissions) {
  const { can, rules } = new AbilityBuilder(createMongoAbility);

  permissions.forEach((perm) => {
    if (perm.canView) can("view", perm.pageName);
    if (perm.canEdit) can("edit", perm.pageName);
  });

  return createMongoAbility(rules);
}
