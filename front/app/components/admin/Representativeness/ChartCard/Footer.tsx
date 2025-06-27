import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { View } from 'components/admin/GraphCard/ViewToggle';
import Legend from 'components/admin/Graphs/Legend';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import FieldInfo, { Props as FieldInfoProps } from './FieldInfo';
import messages from './messages';

interface Props extends FieldInfoProps {
  hideTicks: boolean;
  dataIsTooLong: boolean;
  numberOfHiddenItems: number;
  view: View;
  hideLegend: boolean;
  legendLabels: string[];
  onClickSwitchToTableView: () => void;
}

const TableViewButton = styled.button`
  all: unset;
`;

const normalPadding = '12px 40px 20px 40px';
const smallPadding = '0px 40px 4px 40px';

const Footer = ({
  fieldIsRequired,
  includedUsers,
  hideTicks,
  dataIsTooLong,
  numberOfHiddenItems,
  view,
  hideLegend,
  legendLabels,
  onClickSwitchToTableView,
}: Props) => (
  <>
    <Box
      width="100%"
      p={dataIsTooLong ? smallPadding : normalPadding}
      mt={dataIsTooLong || hideTicks ? '-20px' : undefined}
      display="flex"
      flexDirection="row"
      justifyContent={'space-between'}
    >
      <FieldInfo
        fieldIsRequired={fieldIsRequired}
        includedUsers={includedUsers}
      />

      {!hideLegend && (
        <Box my="16px">
          <Legend
            labels={legendLabels}
            colors={[colors.primary, colors.teal300]}
          />
        </Box>
      )}
    </Box>

    {dataIsTooLong && view !== 'table' && (
      <Box
        p="0px 40px 32px 40px"
        data-testid="representativeness-items-hidden-warning"
      >
        <Warning>
          <FormattedMessage
            {...messages.dataHiddenWarning}
            values={{
              numberOfHiddenItems,
              tableViewLink: (
                <TableViewButton
                  onClick={onClickSwitchToTableView}
                  data-testid="switch-to-table-view-link"
                >
                  <FormattedMessage {...messages.tableViewLinkText} />
                </TableViewButton>
              ),
            }}
          />
        </Warning>
      </Box>
    )}
  </>
);

export default Footer;
