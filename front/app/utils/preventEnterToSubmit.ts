import { KeyboardEvent } from 'react';

// prevent automatically submitting a form when pressing Enter in an input field
const NON_SUBMITTING_INPUT_TYPES = ['submit', 'button', 'reset'];

export const preventEnterToSubmit = (e: KeyboardEvent<HTMLFormElement>) => {
  if (e.key !== 'Enter') return;

  const target = e.target as HTMLElement;
  const submitsOnEnter =
    target.tagName === 'SELECT' ||
    (target.tagName === 'INPUT' &&
      !NON_SUBMITTING_INPUT_TYPES.includes((target as HTMLInputElement).type));

  if (submitsOnEnter) {
    e.preventDefault();
  }
};
