import { KeyboardEvent } from 'react';

// Prevent Enter from submitting the surrounding form (or jumping focus to an
// invalid field) while a month/year dropdown is focused.
export const preventEnterToSubmit = (e: KeyboardEvent<HTMLElement>) => {
  const target = e.target as HTMLElement;
  if (e.key === 'Enter' && target.tagName === 'SELECT') {
    e.preventDefault();
    e.stopPropagation();
  }
};
