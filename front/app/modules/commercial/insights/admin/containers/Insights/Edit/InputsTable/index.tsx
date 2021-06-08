import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// hooks
import useInsightsInputs from 'modules/commercial/insights/hooks/useInsightsInputs';

// components
import { Table, Checkbox } from 'cl2-component-library';
import InputsTableRow from './InputsTableRow';
import EmptyState from './EmptyState';
import Pagination from 'components/admin/Pagination/Pagination';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';
import { stringify } from 'qs';

const StyledTable = styled(Table)`
  background-color: #fff;
  thead {
    tr {
      th {
        padding: 12px;
        font-weight: bold;
      }
    }
  }
  tbody {
    tr {
      cursor: pointer;

      td {
        padding: 12px;
        color: ${colors.label};
        font-size: ${fontSizes.small}px;
      }
    }
    tr:hover {
      background-color: ${colors.background};
    }
  }
`;

const StyledPagination = styled(Pagination)`
  margin-top: 12px;
`;

const InputsTable = ({
  location,
  params: { viewId },
  intl: { formatMessage },
}: WithRouterProps & InjectedIntlProps) => {
  const options = {
    ...(location?.query?.pageNumber
      ? { pageNumber: parseInt(location?.query?.pageNumber, 10) }
      : {}),
  };

  const { list: inputs, currentPage, lastPage } = useInsightsInputs(
    viewId,
    options
  );

  const handlePaginationClick = (newPageNumber) => {
    clHistory.push({
      pathname: location.pathname,
      search: `?${stringify({ ...location.query, pageNumber: newPageNumber })}`,
    });
  };

  // TODO: Implement checkbox logic
  const handleCheckboxChange = () => {};

  if (isNilOrError(inputs)) {
    return null;
  }

  return (
    <div data-testid="insightsInputsTable">
      {inputs.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <StyledTable>
            <colgroup>
              <col span={1} style={{ width: '5%' }} />
              <col span={1} style={{ width: '35%' }} />
              <col span={1} style={{ width: '60%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>
                  <Checkbox checked={false} onChange={handleCheckboxChange} />
                </th>
                <th>{formatMessage(messages.inputsTableInputs)}</th>
                <th>{formatMessage(messages.inputsTableCategories)}</th>
              </tr>
            </thead>
            <tbody>
              {inputs.map((input) => (
                <InputsTableRow input={input} key={input.id} />
              ))}
            </tbody>
          </StyledTable>
          <StyledPagination
            currentPage={currentPage || 1}
            totalPages={lastPage || 1}
            loadPage={handlePaginationClick}
          />
        </>
      )}
    </div>
  );
};

export default injectIntl<{}>(withRouter(InputsTable));
