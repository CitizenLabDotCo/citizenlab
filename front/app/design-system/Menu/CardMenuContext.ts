import { createContext } from 'react';

// Set by a card whose header opens a Menu: the menu then hangs under the
// card's right edge, at the card menu's width.
const CardMenuContext = createContext(false);

export default CardMenuContext;
