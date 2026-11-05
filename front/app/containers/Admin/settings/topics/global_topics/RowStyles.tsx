import { fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import T from 'components/T';

export const RowTitle = styled.span`
  font-size: ${fontSizes.base}px;
  font-weight: 400;
`;

export const RowDescription = styled(T)`
  font-size: ${fontSizes.s}px;
  font-weight: 300;
  p {
    font-size: ${fontSizes.s}px;
    font-weight: 300;
    margin: 0;
  }
`;
