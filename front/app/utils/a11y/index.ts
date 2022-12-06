import { hideVisually } from 'polished';
import { invisibleA11yText } from 'utils/styleUtils';
import styled from 'styled-components';

export const HiddenLabel = styled.label`
  span:first-child {
    ${hideVisually()}
  }
`;

/**
 * Wrap in this component any element that should only be visible by screen readers
 */
export const ScreenReaderOnly = styled.span`
  ${invisibleA11yText()}
`;
