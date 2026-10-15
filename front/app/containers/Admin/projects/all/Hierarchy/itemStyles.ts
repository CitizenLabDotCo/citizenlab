import { focusRing, focusRingInset } from 'global-styles';
import { css } from 'styled-components';

// A card, tile or row opens with one click anywhere on it: its title link,
// marked data-item-link, stretches over the whole item, which has to be
// positioned. Its "⋯" sits above the link, in an element marked data-actions.
export const stretchedLink = css`
  &::after {
    content: '';
    position: absolute;
    inset: 0;
  }
`;

// The title link is the item's one stop for the keyboard. The item shows the
// focus, as the link's own ring would be cut off or only circle the title. The
// links in its "⋯" menu keep their own focus.
const itemFocus = (ring: typeof focusRing) => css`
  &:has([data-item-link]:focus-visible) {
    ${ring}
  }

  [data-item-link]:focus-visible {
    outline: none;
    box-shadow: none;
  }
`;

export const itemFocusRing = itemFocus(focusRing);
export const itemFocusRingInset = itemFocus(focusRingInset);

// The "⋯" shows on hover, while the item has the focus somewhere in it, and
// while its menu is open. Its element has to be positioned above the
// stretched link. Screens without hover, like touch ones, always show it: a
// hidden button would still take the taps.
export const revealActions = css`
  @media (hover: hover) {
    [data-actions] {
      opacity: 0;
      transition: opacity 0.12s;
    }

    &:hover [data-actions],
    &:focus-within [data-actions],
    [data-actions]:has([aria-expanded='true']) {
      opacity: 1;
    }
  }
`;
