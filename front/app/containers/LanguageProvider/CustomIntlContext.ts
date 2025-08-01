import { createContext } from 'react';

import { IntlShapes } from './types';

const CustomIntlContext = createContext<{
  intlShapes: IntlShapes;
  loadLocales: () => void;
}>({} as any);

export default CustomIntlContext;
