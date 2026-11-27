import { createContext } from 'react';

// True inside the redesigned back office's modals, where the form follows the
// design-system library. The previous back office keeps its own look.
const DesignSystemContext = createContext(false);

export default DesignSystemContext;
