import React from 'react';
import styled from 'styled-components';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Legend from 'components/admin/Graphs/Legend';
import Warning from 'components/UI/Warning';
import FieldInfo, { Props as FieldInfoProps } from './FieldInfo';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import { colors } from 'utils/styleUtils';

// typings
import { ViewState } from '.';

interface Props extends FieldInfoProps {
  hideTicks: boolean;
  dataIsTooLong: boolean;
  numberOfHiddenItems: number;
  viewState: ViewState;
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
  includedUserPercentage,
  hideTicks,
  dataIsTooLong,
  numberOfHiddenItems,
  viewState,
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
        includedUserPercentage={includedUserPercentage}
      />

      {!hideLegend && (
        <Legend
          labels={legendLabels}
          colors={[colors.adminTextColor, colors.clBlueLight]}
        />
      )}
    </Box>

    {dataIsTooLong && viewState !== 'table' && (
      <Box
        p="0px 40px 32px 40px"
        data-testid="representativeness-items-hidden-warning"
      >
        <Warning icon="info">
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
