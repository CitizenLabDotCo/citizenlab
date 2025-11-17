import { fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import T from 'components/T';

export const RowTitle = styled(T)`
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 24px;
  margin-right: 10px;
`;

export const RowDescription = styled(T)`
  font-size: ${fontSizes.s}px;
  font-weight: 300;
  line-height: 20px;
`;
