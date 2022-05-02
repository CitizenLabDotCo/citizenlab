import React from 'react';

// components
import { Table } from 'semantic-ui-react';
import { Box } from '@citizenlab/cl2-component-library';
import HeaderRow from './HeaderRow';

// i18n
import messages from '../messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

interface Props {
  legendLabels: string[];
}

const TableComponent = ({
  legendLabels,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const columns = [formatMessage(messages.item), ...legendLabels];

  return (
    <Box mx="40px" my="20px">
      <Table sortable>
        <HeaderRow columns={columns} />
        <Table.Body>
          <Table.Row>
            <Table.Cell>Bla 1</Table.Cell>
            <Table.Cell>Bla 2</Table.Cell>
            <Table.Cell>Bla 3</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </Box>
  );
};

export default injectIntl(TableComponent);
