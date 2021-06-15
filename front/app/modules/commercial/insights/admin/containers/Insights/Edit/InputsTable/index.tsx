import React, { useState, useCallback } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// hooks
import useInsightsInputs from 'modules/commercial/insights/hooks/useInsightsInputs';
import { IInsightsInputData } from 'modules/commercial/insights/services/insightsInputs';

// components
import { Table, Checkbox } from 'cl2-component-library';
import InputsTableRow from './InputsTableRow';
import EmptyState from './EmptyState';
import SideModal from 'components/UI/SideModal';
import InputDetails from '../InputDetails';
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
  location: { query },
  intl: { formatMessage },
}: WithRouterProps & InjectedIntlProps) => {
  const [isSideModalOpen, setIsSideModalOpen] = useState(false);
  const [selectedInputIndex, setSelectedInputIndex] = useState<number | null>(
    null
  );

  const closeSideModal = () => setIsSideModalOpen(false);
  const openSideModal = () => setIsSideModalOpen(true);

  const pageNumber = parseInt(location?.query?.pageNumber, 10);

  const { list: inputs, lastPage } = useInsightsInputs(viewId, {
    pageNumber,
    category: query.category,
  });

  // As an example
  // const unCategorized = useInsightsInputs(viewId, {
  //   pageNumber,
  //   category: '',
  // });

  const handlePaginationClick = (newPageNumber) => {
    clHistory.push({
      pathname: location.pathname,
      search: `?${stringify({ ...location.query, pageNumber: newPageNumber })}`,
    });
  };

  // Use callback to keep references for moveUp and moveDown stable
  const moveUp = useCallback(() => {
    setSelectedInputIndex((prevSelectedIndex) => {
      if (!isNilOrError(prevSelectedIndex)) {
        return prevSelectedIndex - 1;
      } else return prevSelectedIndex;
    });
  }, []);

  const moveDown = useCallback(() => {
    setSelectedInputIndex((prevSelectedIndex) => {
      if (!isNilOrError(prevSelectedIndex)) {
        return prevSelectedIndex + 1;
      } else return prevSelectedIndex;
    });
  }, []);

  if (isNilOrError(inputs)) {
    return null;
  }

  // TODO: Implement checkbox logic
  const handleCheckboxChange = () => {};

  const selectInput = (input: IInsightsInputData) => () => {
    setSelectedInputIndex(inputs.indexOf(input));
    openSideModal();
  };

  return (
    <div data-testid="insightsInputsTable">
      {inputs.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <StyledTable>
            <colgroup>
              <col span={1} style={{ width: '5%' }} />
              <col span={1} style={{ width: '30%' }} />
              <col span={1} style={{ width: '65%' }} />
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
                <InputsTableRow
                  input={input}
                  key={input.id}
                  onSelect={selectInput(input)}
                />
              ))}
            </tbody>
          </StyledTable>
          <StyledPagination
            currentPage={pageNumber || 1}
            totalPages={lastPage || 1}
            loadPage={handlePaginationClick}
          />
        </>
      )}
      <SideModal opened={isSideModalOpen} close={closeSideModal}>
        {!isNilOrError(selectedInputIndex) && (
          <>
            <InputDetails
              selectedInput={inputs[selectedInputIndex]}
              moveUp={moveUp}
              moveDown={moveDown}
              isMoveUpDisabled={selectedInputIndex === 0}
              isMoveDownDisabled={selectedInputIndex === inputs.length - 1}
            />
          </>
        )}
      </SideModal>
    </div>
  );
};

export default withRouter(injectIntl(InputsTable));
