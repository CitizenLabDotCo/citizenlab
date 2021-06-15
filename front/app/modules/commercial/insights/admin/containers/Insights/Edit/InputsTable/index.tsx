import React, { useState, useCallback, useEffect } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { stringify } from 'qs';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// hooks
import useInsightsInputs from 'modules/commercial/insights/hooks/useInsightsInputs';
import { IInsightsInputData } from 'modules/commercial/insights/services/insightsInputs';

// components
import { Table } from 'cl2-component-library';
import InputsTableRow from './InputsTableRow';
import EmptyState from './EmptyState';
import CheckboxWithPartialCheck from 'components/UI/CheckboxWithPartialCheck';
import SideModal from 'components/UI/SideModal';
import InputDetails from '../InputDetails';
import Divider from 'components/admin/Divider';
import Actions from './Actions';
import Pagination from 'components/admin/Pagination/Pagination';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';
import TableTitle from './TableTitle';

const Inputs = styled.div`
  flex: 1;
  background: #fff;
  overflow-x: auto;
  overflow-y: auto;
  padding: 40px;
`;

const TitleRow = styled.div`
  display: flex;
  min-height: 43px;
`;

const StyledActions = styled(Actions)`
  margin-left: 60px;
`;

const StyledDivider = styled(Divider)`
  margin-top: 6px;
`;

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
  // State
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isSideModalOpen, setIsSideModalOpen] = useState(false);
  const [previewedInputIndex, setPreviewedInputIndex] = useState<number | null>(
    null
  );

  // Data fetching -------------------------------------------------------------
  const pageNumber = parseInt(location?.query?.pageNumber, 10);
  const selectedCategory = query.category;

  const { list: inputs, lastPage } = useInsightsInputs(viewId, {
    pageNumber,
    category: selectedCategory,
  });

  // Callbacks and Effects -----------------------------------------------------

  // Table Selection
  // Reset selection on page change
  useEffect(() => {
    setSelectedRows(new Set());
  }, [selectedCategory, pageNumber]);

  // Side Modal Preview
  // Use callback to keep references for moveUp and moveDown stable
  const moveUp = useCallback(() => {
    setPreviewedInputIndex((prevSelectedIndex) => {
      if (!isNilOrError(prevSelectedIndex)) {
        return prevSelectedIndex - 1;
      } else return prevSelectedIndex;
    });
  }, []);

  const moveDown = useCallback(() => {
    setPreviewedInputIndex((prevSelectedIndex) => {
      if (!isNilOrError(prevSelectedIndex)) {
        return prevSelectedIndex + 1;
      } else return prevSelectedIndex;
    });
  }, []);

  // From this point we need data ----------------------------------------------
  if (isNilOrError(inputs)) {
    return null;
  }

  // Pagination ----------------------------------------------------------------
  const handlePaginationClick = (newPageNumber) => {
    clHistory.push({
      pathname: location.pathname,
      search: `?${stringify({ ...location.query, pageNumber: newPageNumber })}`,
    });
  };

  // Selection and Actions -----------------------------------------------------
  const handleCheckboxChange = () => {
    if (selectedRows.size === 0) {
      const newSelection = new Set(inputs.map((input) => input.id));
      setSelectedRows(newSelection);
    } else {
      const newSelection = new Set<string>();
      setSelectedRows(newSelection);
    }
  };

  const toggleInputSelected = (input: IInsightsInputData) => () => {
    const newSelection = new Set(selectedRows);
    if (selectedRows.has(input.id)) {
      newSelection.delete(input.id);
      setSelectedRows(newSelection);
    } else {
      newSelection.add(input.id);
      setSelectedRows(newSelection);
    }
  };

  // Side Modal Preview --------------------------------------------------------
  const closeSideModal = () => setIsSideModalOpen(false);
  const openSideModal = () => setIsSideModalOpen(true);

  const previewInput = (input: IInsightsInputData) => () => {
    setPreviewedInputIndex(inputs.indexOf(input));
    openSideModal();
  };

  return (
    <Inputs data-testid="insightsInputsTable">
      <TitleRow>
        <TableTitle />
        <StyledActions selectedInputs={selectedRows} />
      </TitleRow>
      <StyledDivider />
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
                  <CheckboxWithPartialCheck
                    onChange={handleCheckboxChange}
                    checked={
                      selectedRows.size === inputs.length
                        ? true
                        : selectedRows.size === 0
                        ? false
                        : 'mixed'
                    }
                    data-testid="headerCheckBox"
                  />
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
                  selected={selectedRows.has(input.id)}
                  changeSelected={toggleInputSelected(input)}
                  onPreview={previewInput(input)}
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
        {!isNilOrError(previewedInputIndex) && (
          <InputDetails
            selectedInput={inputs[previewedInputIndex]}
            moveUp={moveUp}
            moveDown={moveDown}
            isMoveUpDisabled={previewedInputIndex === 0}
            isMoveDownDisabled={previewedInputIndex === inputs.length - 1}
          />
        )}
      </SideModal>
    </Inputs>
  );
};

export default withRouter(injectIntl(InputsTable));
