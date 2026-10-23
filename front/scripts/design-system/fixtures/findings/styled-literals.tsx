import styled from 'styled-components';
import { colors } from '@citizenlab/cl2-component-library';

const theme = { borderRadius: '3px' };

export const Card = styled.div`
  padding: 12px;
  color: #1e1e1e;
  background: rgba(0, 0, 0, 0.5);
  border-radius: ${theme.borderRadius};
  margin: ${colors.divider};
  border: 1px solid white;
`;
