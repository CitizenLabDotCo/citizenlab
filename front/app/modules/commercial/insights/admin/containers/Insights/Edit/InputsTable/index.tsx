import React, { useState, useCallback } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { stringify } from 'qs';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// hooks
import useInsightsInputs from 'modules/commercial/insights/hooks/useInsightsInputs';
import { IInsightsInputData } from 'modules/commercial/insights/services/insightsInputs';

// components
import { Table, Checkbox, Icon } from 'cl2-component-library';
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

const StyledTable = styled(Table)`
  thead {
    tr {
      th {
        padding: 12px 4px;
        font-weight: bold;
      }
    }
  }
  tbody {
    tr {
      cursor: pointer;
      height: 56px;

      td {
        padding: 12px 4px;
        color: ${colors.label};
        font-size: ${fontSizes.small}px;
        > * {
          margin: 0;
        }
      }
    }
    tr:hover {
      background-color: ${colors.background};
    }
  }
`;

const StyledSort = styled.div`
  display: flex;
  align-items: center !important;
  cursor: pointer;
  font-weight: bold;
  svg {
    width: 10px;
    margin-left: 4px;
  }
`;

const StyledPagination = styled(Pagination)`
  margin-top: 12px;
`;

const InputsTable = ({
  params: { viewId },
  location: { query, pathname },
  intl: { formatMessage },
}: WithRouterProps & InjectedIntlProps) => {
  const [isSideModalOpen, setIsSideModalOpen] = useState(false);
  const [selectedInputIndex, setSelectedInputIndex] = useState<number | null>(
    null
  );

  const closeSideModal = () => setIsSideModalOpen(false);
  const openSideModal = () => setIsSideModalOpen(true);

  const pageNumber = parseInt(query?.pageNumber, 10);

  const { list: inputs, lastPage } = useInsightsInputs(viewId, {
    pageNumber,
    category: query.category,
  });

  const handlePaginationClick = (newPageNumber: number) => {
    clHistory.push({
      pathname,
      search: `?${stringify({ ...query, pageNumber: newPageNumber })}`,
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

  const onSort = () => {
    clHistory.push({
      pathname,
      search: stringify(
        {
          ...query,
          sort: query.sort === '-approval' ? 'approval' : '-approval',
        },
        { addQueryPrefix: true }
      ),
    });
  };

  return (
    <div data-testid="insightsInputsTable">
      {inputs.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <StyledTable>
            <colgroup>
              <col span={1} style={{ width: '2.5%' }} />
              <col span={1} style={{ width: '30%' }} />
              {query.category && <col span={1} style={{ width: '2.5%' }} />}
              <col span={1} style={{ width: '65%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>
                  <Checkbox checked={false} onChange={handleCheckboxChange} />
                </th>
                <th>{formatMessage(messages.inputsTableInputs)}</th>
                <th>
                  {query.category ? (
                    <StyledSort
                      onClick={onSort}
                      as="button"
                      data-testid="insightsSortButton"
                    >
                      {formatMessage(messages.inputsTableCategories)}
                      <Icon
                        name={
                          query.sort === '-approval'
                            ? 'chevron-up'
                            : 'chevron-down'
                        }
                      />
                    </StyledSort>
                  ) : (
                    formatMessage(messages.inputsTableCategories)
                  )}
                </th>
                {query.category && (
                  <th>{formatMessage(messages.inputsTableAlsoIn)}</th>
                )}
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
      {!isNilOrError(selectedInputIndex) &&
        !isNilOrError(inputs[selectedInputIndex]) && (
          <SideModal opened={isSideModalOpen} close={closeSideModal}>
            <InputDetails
              selectedInput={inputs[selectedInputIndex]}
              moveUp={moveUp}
              moveDown={moveDown}
              isMoveUpDisabled={selectedInputIndex === 0}
              isMoveDownDisabled={selectedInputIndex === inputs.length - 1}
            />
          </SideModal>
        )}
    </div>
  );
};

export default withRouter(injectIntl(InputsTable));
