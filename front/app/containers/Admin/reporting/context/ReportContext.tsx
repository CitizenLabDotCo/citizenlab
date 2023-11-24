import { createContext } from 'react';

export const ReportContext = createContext<'phase' | 'pdf'>('pdf');
