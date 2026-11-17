import { createContext, useContext } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import { css } from 'styled-components';

export type CommentsVariant = 'default' | 'panel';

// A context because the comment forms sit several components below the section
// that decides their look.
export const CommentsVariantContext = createContext<CommentsVariant>('default');

export const useIsPanelComments = () =>
  useContext(CommentsVariantContext) === 'panel';

// The frame of a comment form in the default look. The panel look draws its
// frame with the `form` class of commentsPanel.module.css instead.
export const defaultCommentFormFrame = css<{ variant: CommentsVariant }>`
  ${({ variant }) =>
    variant === 'default' &&
    css`
      border: 1px solid ${colors.borderDark};
      border-radius: ${(props) => props.theme.borderRadius};

      &:not(.focused):hover {
        border-color: ${colors.black};
      }

      &.focused {
        border: solid 2px ${(props) => props.theme.colors.tenantPrimary};
      }
    `}
`;

// MentionsTextArea takes its text style as props. In the panel it uses the
// design-system UI text style; line height stays a pixel value because the
// text area computes its minimum height from it.
export const panelTextAreaStyle = {
  color: 'var(--gv-text-primary)',
  fontSize: 'var(--gv-font-size-13)',
  fontWeight: 'var(--gv-font-weight-regular)',
  lineHeight: '20px',
};
