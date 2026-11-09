import { createContext, useContext } from 'react';

import { bo, colors } from '@citizenlab/cl2-component-library';
import { css } from 'styled-components';

// A context because the comment forms sit several components below the section
// that decides their look.
export const CommentsVariantContext = createContext<'default' | 'bo'>(
  'default'
);

export const useIsBoComments = () =>
  useContext(CommentsVariantContext) === 'bo';

export const boCommentFormStyle = css`
  &.bo {
    border: 1px solid ${colors.grey300};
    border-radius: ${bo.borderRadius};

    &:not(.focused):hover {
      border-color: ${colors.grey300};
    }

    &.focused {
      border: 1px solid ${(props) => props.theme.colors.tenantPrimary};
    }
  }
`;
