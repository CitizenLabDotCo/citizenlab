import { expect } from '@storybook/jest';

export const el = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument();
  return element as HTMLElement;
};
