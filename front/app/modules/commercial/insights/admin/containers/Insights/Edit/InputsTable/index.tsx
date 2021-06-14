import React, { useState, useCallback, useEffect } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';

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
  margin-bottom: 15px;
  min-height: 43px;
`;

const StyledActions = styled(Actions)`
  margin-left: 60px;
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

const InputsTable = ({
  params: { viewId },
  location: { query },
  intl: { formatMessage },
}: WithRouterProps & InjectedIntlProps) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isSideModalOpen, setIsSideModalOpen] = useState(false);
  const [previewedInputIndex, setPreviewedInputIndex] = useState<number | null>(
    null
  );

  const closeSideModal = () => setIsSideModalOpen(false);
  const openSideModal = () => setIsSideModalOpen(true);

  const selectedCategory = query.category;

  // Reset selection on page change
  useEffect(() => {
    setSelectedRows(new Set());
  }, [selectedCategory]);

  const inputs = useInsightsInputs(viewId, { category: selectedCategory });

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

  if (isNilOrError(inputs)) {
    return null;
  }

  const previewInput = (input: IInsightsInputData) => () => {
    setPreviewedInputIndex(inputs.indexOf(input));
    openSideModal();
  };

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
    if (selectedRows.has(input.id)) {
      const newSelection = new Set(selectedRows);
      newSelection.delete(input.id);
      setSelectedRows(newSelection);
    } else {
      const newSelection = new Set(selectedRows);
      newSelection.add(input.id);
      setSelectedRows(newSelection);
    }
  };

  return (
    <Inputs data-testid="insightsInputsTable">
      {inputs.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <TitleRow>
            <TableTitle />
            <StyledActions selectedInputs={selectedRows} />
          </TitleRow>
          <Divider />

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
