import React from 'react';
import styled from 'styled-components';

import messages from '../../messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { Icon } from 'cl2-component-library';
import { fontSizes, colors } from 'utils/styleUtils';

const StyledEmptyState = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  font-size: ${fontSizes.base}px;
  color: ${colors.label};
  font-weight: bold;
  line-height: 25px;
  padding-top: 80px;
  svg {
    margin-bottom: 20px;
    height: 35px;
  }
`;

const EmptyState = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  return (
    <StyledEmptyState data-testid="insightsInputsTableEmptyState">
      <Icon name="blankPage" />
      {formatMessage(messages.inputsTableEmpty)}
    </StyledEmptyState>
  );
};

export default injectIntl(EmptyState);
