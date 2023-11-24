import { createContext } from 'react';
import { ReportType } from '../types';

export const ReportContext = createContext<ReportType>('pdf');
