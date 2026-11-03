import {
  bo,
  colors,
  fontSizes,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

// The date and time pickers render their own bordered trigger buttons. Inside
// a DateFieldRow they read as plain text segments, so the row draws the only
// border. Their popups mount inside the segment too, so the rules skip those.
const DateFieldSegment = styled.div`
  && button:not([data-tippy-root] button) {
    height: 28px;
    padding: 0 6px;
    border: none;
    border-radius: ${stylingConsts.borderRadius};
    box-shadow: none;
    background: transparent;
    font-size: ${fontSizes.xs}px;
    color: ${bo.colors.textHeadingStrong};
    white-space: nowrap;

    &:focus {
      border: none;
    }

    &:hover,
    &:focus-visible {
      background: ${colors.grey100};
      color: ${bo.colors.textHeadingStrong};
    }

    > div {
      margin-right: 0;
    }

    svg {
      display: none;
    }
  }
`;

export default DateFieldSegment;
