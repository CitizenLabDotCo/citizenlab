import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import useInsightsInputs from 'modules/commercial/insights/hooks/useInsightsInputs';
import InputsTableRow from './InputsTableRow';
import { Table, Checkbox } from 'cl2-component-library';
import styled from 'styled-components';

const StyledTable = styled(Table)`
  th {
    padding: 12px;
  }
  tbody {
    tr {
      td {
        padding: 12px;
      }
    }
  }
`;

const InputsTable = ({ params: { viewId } }: WithRouterProps) => {
  const inputs = useInsightsInputs(viewId);
  if (isNilOrError(inputs)) {
    return null;
  }
  return (
    <StyledTable>
      <colgroup>
        <col span={1} style={{ width: '5%' }} />
        <col span={1} style={{ width: '35%' }} />
        <col span={1} style={{ width: '60%' }} />
      </colgroup>
      <tbody>
        <th>
          <Checkbox checked={false} onChange={() => {}} />
        </th>
        <th>Inputs</th>
        <th>Categories</th>

        {inputs.map((input) => (
          <InputsTableRow input={input} key={input.id} />
        ))}
      </tbody>
    </StyledTable>
  );
};

export default withRouter(InputsTable);
