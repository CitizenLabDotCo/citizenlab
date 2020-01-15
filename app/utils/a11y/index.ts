import styled from 'styled-components';
import { hideVisually } from 'polished';
import { invisibleA11yText } from 'utils/styleUtils';

export const HiddenLabel = styled.label`
  span:first-child {
    ${hideVisually()}
  }
`;

/**
 * Our fieldsets usually don't have borders
 */
export const Fieldset = styled.fieldset`
  border: none;
`;

/**
 * Wrap in this component any element that should only be visible by screen readers
 */
export const ScreenReaderOnly = styled.span`
  ${invisibleA11yText()}
`;
