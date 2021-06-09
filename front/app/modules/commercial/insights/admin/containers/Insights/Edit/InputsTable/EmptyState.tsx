import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// intl
import messages from '../../messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// components
import { Icon } from 'cl2-component-library';

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
  text-align: center;
  svg {
    margin-bottom: 20px;
    height: 35px;
  }
  p {
    font-weight: normal;
    font-size: ${fontSizes.small}px;
    margin-top: 16px;
  }
`;

const EmptyState = ({
  intl: { formatMessage },
  location: { query },
}: InjectedIntlProps & WithRouterProps) => {
  return (
    <StyledEmptyState data-testid="insightsInputsTableEmptyState">
      <Icon name="blankPage" />
      {query.category ? (
        <>
          {formatMessage(messages.inputsTableCategoryTitle)}
          <p>{formatMessage(messages.inputsTableCategoryDescription)}</p>
        </>
      ) : (
        formatMessage(messages.inputsTableEmpty)
      )}
    </StyledEmptyState>
  );
};

export default injectIntl<{}>(withRouter(EmptyState));
