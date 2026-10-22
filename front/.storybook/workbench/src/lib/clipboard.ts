// Copies text; false when the browser does not allow it (no clipboard
// API, no permission, an insecure origin), so the caller shows the text.
export const copyText = async (text: string): Promise<boolean> => {
  try {
    if (!navigator.clipboard) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
