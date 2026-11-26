import { ReactNode, createContext } from 'react';

// Lets an area show its own placeholder while a page inside it loads.
const PageLoadingFallbackContext = createContext<ReactNode>(undefined);

export default PageLoadingFallbackContext;
