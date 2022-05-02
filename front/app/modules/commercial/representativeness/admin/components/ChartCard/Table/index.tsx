import React from 'react';
import styled from 'styled-components';

// components
import { Table } from 'semantic-ui-react';
import { Box } from '@citizenlab/cl2-component-library';
import HeaderRow from './HeaderRow';
import Row from './Row';

// i18n
import messages from '../messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// typings
import { RepresentativenessData } from '..';

const StyledBody = styled(Table.Body)`
  td:first-child {
    background-color: #f9fafb;
  }
`;

interface Props {
  data: RepresentativenessData;
  legendLabels: string[];
}

const TableComponent = ({
  data,
  legendLabels,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const columns = [formatMessage(messages.item), ...legendLabels];
  const slicedData = data.slice(0, 12);

  return (
    <Box mx="40px" my="20px">
      <Table>
        <HeaderRow columns={columns} />
        <StyledBody>
          {slicedData.map((row, i) => (
            <Row row={row} key={i} />
          ))}
        </StyledBody>
      </Table>
    </Box>
  );
};

export default injectIntl(TableComponent);
