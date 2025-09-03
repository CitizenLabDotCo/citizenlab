import { createContext } from 'react';

import { IntlShapes } from './types';

const CustomIntlContext = createContext<{
  intlShapes: IntlShapes;
  loadLocales: () => Promise<void>;
}>({} as any);

export default CustomIntlContext;
