import { Tr, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { itemFocusRingInset, revealActions } from '../itemStyles';

// A space, folder or project row. Its title link stretches over the whole row,
// so the row opens with one click and is one stop for the keyboard. The cells
// clip their overflow, which would cut the link's own focus ring, so the row
// shows it instead, inside its edges.
const ItemRow = styled(Tr)`
  position: relative;

  &:hover {
    background: ${colors.grey50};
  }

  ${itemFocusRingInset}
  ${revealActions}

  td {
    height: 36px;
    padding: 0 8px;
    white-space: nowrap;
    overflow: hidden;
  }
`;

export default ItemRow;
