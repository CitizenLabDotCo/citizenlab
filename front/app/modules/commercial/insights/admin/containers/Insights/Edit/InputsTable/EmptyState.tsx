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

import { getSelectedCategoryFilter } from '../';

const StyledEmptyState = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  padding-top: 80px;
  text-align: center;
  svg {
    margin-bottom: 20px;
    height: 35px;
  }
  h1 {
    font-weight: bold;
    line-height: 25px;
    font-size: ${fontSizes.base}px;
    color: ${colors.label};
  }
  p {
    font-weight: normal;
    font-size: ${fontSizes.small}px;
  }
`;

const EmptyState = ({
  intl: { formatMessage },
  location: { query },
}: InjectedIntlProps & WithRouterProps) => {
  const selectedCategoryFilter = getSelectedCategoryFilter(query.category);
  return (
    <StyledEmptyState data-testid="insightsInputsTableEmptyState">
      <Icon name="blankPage" />
      {selectedCategoryFilter === 'allInput' &&
        formatMessage(messages.inputsTableEmpty)}
      {selectedCategoryFilter === 'notCategorized' && (
        <p>{formatMessage(messages.inputsTableNotCategorized)}</p>
      )}
      {selectedCategoryFilter === 'category' && (
        <>
          <h1>{formatMessage(messages.inputsTableCategoryTitle)}</h1>
          <p>{formatMessage(messages.inputsTableCategoryDescription)}</p>
        </>
      )}
    </StyledEmptyState>
  );
};

export default withRouter(injectIntl(EmptyState));
