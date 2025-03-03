import { format } from 'date-fns';

export const formatDuration = (date: string | null) => {
  if (!date) return '';
  return format(new Date(date), 'MMM yy');
};
