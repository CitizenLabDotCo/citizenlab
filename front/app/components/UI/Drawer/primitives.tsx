import { colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

export const DragHandle = styled.div`
  width: 40px;
  height: 4px;
  background: ${colors.grey400};
  border-radius: 2px;
  margin: 8px auto 0;
`;

export const DragArea = styled.div`
  position: relative;
  width: 100%;
  padding: 8px 0;
  touch-action: none;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  &::before {
    content: '';
    position: absolute;
    top: -32px;
    left: 0;
    right: 0;
    bottom: -32px;
  }
`;
