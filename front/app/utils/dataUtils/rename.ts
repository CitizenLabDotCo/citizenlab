type RenameInstructions<T> = {
  [Poperty in keyof T]?: string;
};

const rename = <T extends Record<string, string>>(
  data: T[],
  renameInstructions: RenameInstructions<T>
): Record<string, any>[] => {
  return data.map((row) => {
    const newRow = { ...row };

    for (const key in renameInstructions) {
      const value = row[key];
      delete newRow[key];
      const newKey = renameInstructions[key] as keyof T;
      newRow[newKey] = value;
    }

    return newRow;
  });
};

export default rename;
