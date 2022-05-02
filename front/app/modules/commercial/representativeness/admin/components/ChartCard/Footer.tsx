import React from 'react';

// hooks
import { useTheme } from 'styled-components';

// components
import { Box, Icon, Text } from '@citizenlab/cl2-component-library';
import Legend from 'components/admin/Graphs/Legend';
import Warning from 'components/UI/Warning';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const StyledIcon = styled(Icon)`
  transform: translateY(-1px);
`;

const Separator = styled.span`
  margin: 0px 4px;
`;

interface RequiredOrOptionalProps {
  fieldIsRequired: boolean;
}

interface Props extends RequiredOrOptionalProps {
  includedUserPercentage: number;
  hideTicks: boolean;
  dataIsTooLong: boolean;
  numberOfHiddenItems: number;
  legendLabels: string[];
}

const RequiredOrOptional = ({ fieldIsRequired }: RequiredOrOptionalProps) =>
  fieldIsRequired ? (
    <b>
      <FormattedMessage {...messages.required} />
    </b>
  ) : (
    <b>
      <FormattedMessage {...messages.optional} />
    </b>
  );

const normalPadding = '12px 40px 20px 40px';
const smallPadding = '0px 40px 4px 40px';

const Footer = ({
  fieldIsRequired,
  includedUserPercentage,
  hideTicks,
  dataIsTooLong,
  numberOfHiddenItems,
  legendLabels,
}: Props) => {
  const { newBarFill, secondaryNewBarFill }: any = useTheme();

  return (
    <>
      <Box
        width="100%"
        p={dataIsTooLong ? smallPadding : normalPadding}
        mt={dataIsTooLong || hideTicks ? '-20px' : undefined}
        display="flex"
        flexDirection="row"
        justifyContent={dataIsTooLong ? 'center' : 'space-between'}
      >
        {!dataIsTooLong && (
          <Text fontSize="s" color="adminSecondaryTextColor">
            <StyledIcon
              name="user"
              width="16px"
              height="16px"
              fill={colors.adminSecondaryTextColor}
              mr="6px"
            />
            <FormattedMessage
              {...messages.percentageUsersIncluded}
              values={{
                percentage: <b>{includedUserPercentage}%</b>,
              }}
            />
            <Separator>•</Separator>
            <FormattedMessage
              {...messages.forUserRegistation}
              values={{
                requiredOrOptional: (
                  <RequiredOrOptional fieldIsRequired={fieldIsRequired} />
                ),
              }}
            />
          </Text>
        )}
        <Legend
          labels={legendLabels}
          colors={[newBarFill, secondaryNewBarFill]}
        />
      </Box>

      {dataIsTooLong && (
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
                  <a>
                    <FormattedMessage {...messages.tableViewLinkText} />
                  </a>
                ),
              }}
            />
          </Warning>
        </Box>
      )}
    </>
  );
};

export default Footer;
