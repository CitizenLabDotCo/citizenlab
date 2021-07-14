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
import ScanCategory from './ScanCategory';

import getSelectedCategoryFilter from 'modules/commercial/insights/utils/getSelectedCategoryFilter';

const StyledEmptyState = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  text-align: center;
  svg {
    margin-top: 92px;
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
      {selectedCategoryFilter === 'category' && <ScanCategory />}
      <Icon name="blankPage" />
      {query.search ? (
        <div data-testid="insightsInputsTableEmptyNoResults">
          <h1>{formatMessage(messages.inputsTableNoResults)}</h1>
          <p>{formatMessage(messages.inputsTableNoResultsDescription)}</p>
        </div>
      ) : (
        <>
          {selectedCategoryFilter === 'allInput' && (
            <p data-testid="insightsInputsTableEmptyAllInputs">
              {formatMessage(messages.inputsTableEmpty)}
            </p>
          )}
          {selectedCategoryFilter === 'notCategorized' && (
            <p data-testid="insightsInputsTableEmptyNotCategorized">
              {formatMessage(messages.inputsTableNotCategorized)}
            </p>
          )}
          {selectedCategoryFilter === 'category' && (
            <div data-testid="insightsInputsTableEmptyNoInputInCategory">
              <h1>{formatMessage(messages.inputsTableCategoryTitle)}</h1>
              <p>{formatMessage(messages.inputsTableCategoryDescription)}</p>
            </div>
          )}
        </>
      )}
    </StyledEmptyState>
  );
};

export default withRouter(injectIntl(EmptyState));
