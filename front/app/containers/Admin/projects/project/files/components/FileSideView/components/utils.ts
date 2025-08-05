export const getFileExtensionString = (fileName: string): string => {
  const finalDotIndex = fileName.lastIndexOf('.');
  return finalDotIndex !== -1 ? fileName.slice(finalDotIndex + 1) : '';
};

export const getFileNameWithoutExtension = (fileName: string): string => {
  const finalDotIndex = fileName.lastIndexOf('.');
  return finalDotIndex !== -1 ? fileName.slice(0, finalDotIndex) : fileName;
};
