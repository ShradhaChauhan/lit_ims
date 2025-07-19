const hasPageAccess = (permissions, pageName) => {
  const page = permissions?.find((p) => p.pageName === pageName);
  return page?.canView || page?.canEdit;
};

export default hasPageAccess;
