import React from 'react';
import ThemeContext from './ThemeContext';

export default (Story) => (
  <ThemeContext>
    <Story />
  </ThemeContext>
)