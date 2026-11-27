import { createContext } from 'react';

// True inside the new back office, whose multilingual fields pick their
// language with the translated field design (picker and languages count). Screens outside it keep the segmented switcher, even when
// the redesign flag is on.
const LanguageButtonContext = createContext(false);

export default LanguageButtonContext;
