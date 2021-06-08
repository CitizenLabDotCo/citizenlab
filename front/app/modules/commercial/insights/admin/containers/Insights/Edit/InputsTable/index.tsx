import React, { useCallback, useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useInsightsInputs from 'modules/commercial/insights/hooks/useInsightsInputs';

// components
import { Table, Checkbox } from 'cl2-component-library';
import InputsTableRow from './InputsTableRow';
import EmptyState from './EmptyState';
import CheckboxWithPartialCheck from 'components/UI/CheckboxWithPartialCheck';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

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

const InputsTable = ({
  params: { viewId },
  intl: { formatMessage },
}: WithRouterProps & InjectedIntlProps) => {
  const inputs = useInsightsInputs(viewId);
  const [selectedRows, setSelectedRows] = useState(new Set());

  if (isNilOrError(inputs)) {
    return null;
  }

  const handleCheckboxChange = () => {
    if (selectedRows.size === 0) {
      const newSelection = new Set(inputs.map((input) => input.id));
      setSelectedRows(newSelection);
    } else {
      const newSelection = new Set();
      setSelectedRows(newSelection);
    }
  };

  const toggleInputSelected = (id: string) => {
    if (selectedRows.has(id)) {
      const newSelection = new Set(selectedRows);
      newSelection.delete(id);
      setSelectedRows(newSelection);
    } else {
      const newSelection = new Set(selectedRows);
      newSelection.add(id);
      setSelectedRows(newSelection);
    }
  };

  return (
    <div data-testid="insightsInputsTable">
      {inputs.length === 0 ? (
        <EmptyState />
      ) : (
        <StyledTable>
          <colgroup>
            <col span={1} style={{ width: '5%' }} />
            <col span={1} style={{ width: '35%' }} />
            <col span={1} style={{ width: '60%' }} />
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
                onSelect={toggleInputSelected}
              />
            ))}
          </tbody>
        </StyledTable>
      )}
    </div>
  );
};

export default injectIntl<{}>(withRouter(InputsTable));
