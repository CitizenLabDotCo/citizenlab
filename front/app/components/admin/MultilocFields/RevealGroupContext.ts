import { createContext } from 'react';

// Opens the collapsed card around a language group, so its error can be seen.
const RevealGroupContext = createContext<(() => void) | null>(null);

export default RevealGroupContext;
