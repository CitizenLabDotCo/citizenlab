import React, { ReactElement } from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';
import messages from './messages';

const OrContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 15px;
  margin-bottom: 25px;
`;

const Line = styled.span`
  flex: 1;
  height: 1px;
  background: #e0e0e0;
`;

const OrText = styled.div`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  text-transform: lowercase;
  padding-left: 10px;
  padding-right: 10px;
`;

const Or = (): ReactElement => {
  return (
    <OrContainer aria-hidden>
      <Line />
      <OrText>
        <FormattedMessage {...messages.or} />
      </OrText>
      <Line />
    </OrContainer>
  );
};

export default Or;
