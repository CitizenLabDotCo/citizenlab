import { invisibleA11yText } from '@citizenlab/cl2-component-library';
import { hideVisually } from 'polished';
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

/**
 * Joins truthy strings into a space-separated list for ARIA attributes that
 * take IDREFS (e.g. aria-describedby, aria-labelledby, aria-controls).
 * Returns undefined when no ids remain so the attribute is omitted entirely.
 *
 * @example
 *   <a aria-describedby={joinAriaIds(
 *     hasDescription && descriptionId,
 *     showCount && countId,
 *   )}>...</a>
 */
export const joinAriaIds = (
  ...ids: (string | false | null | undefined)[]
): string | undefined => ids.filter(Boolean).join(' ') || undefined;
