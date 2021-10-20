import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

export default function useTheme() {
  const theme = useContext(ThemeContext);
  return theme || {};
}
