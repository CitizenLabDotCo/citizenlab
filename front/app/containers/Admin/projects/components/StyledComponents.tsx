import { fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';

export const RowContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const RowContentInner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-right: 20px;
`;

export const RowTitle = styled(T)`
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 24px;
  margin-right: 10px;
`;

export const ActionsRowContainer = styled.div`
  display: flex;
`;

export const RowButton = styled(ButtonWithLink)`
  margin-left: 7px;
`;
