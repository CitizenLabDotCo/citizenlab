import { createContext } from 'react';

export type BreadcrumbSeparator = 'chevron' | 'slash';

export const SeparatorContext = createContext<BreadcrumbSeparator>('chevron');
