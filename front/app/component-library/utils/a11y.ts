import styled from 'styled-components';

import { invisibleA11yText } from './styleUtils';

/**
 * Wrap in this component any element that should only be visible by screen readers
 */
export const ScreenReaderOnly = styled.span`
  ${invisibleA11yText()}
`;
