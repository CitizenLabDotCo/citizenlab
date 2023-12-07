import { createContext } from 'react';
import { IntlShapes } from './types';

const CustomIntlContext = createContext<IntlShapes>({} as any);

export default CustomIntlContext;
