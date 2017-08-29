
export const appenDableName = (name) => {
  const camelName = name.replace(/((_|^)\w)/g, (m) => m.slice(-1)[0].toUpperCase());
  return camelName.charAt(0).toUpperCase() + camelName.slice(1);
};

export const toCammelCase = (name) => name.replace(/(_\w)/g, (m) => m.slice(-1)[0].toUpperCase());
