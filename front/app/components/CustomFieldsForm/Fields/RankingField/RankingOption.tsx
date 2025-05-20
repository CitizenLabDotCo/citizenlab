import React from 'react';

import {
  Box,
  Icon,
  IOption,
  Label,
  Text,
  Select,
} from '@citizenlab/cl2-component-library';

import { Drag } from 'components/FormBuilder/components/DragAndDrop';
import styled, { useTheme } from 'styled-components';
import { useIntl } from 'utils/cl-intl';
import { ScreenReaderOnly } from 'utils/a11y';
import messages from 'components/Form/Components/Controls/messages';

const StyledSelect = styled(Select)`
  min-width: 52px;
  margin-right: 12px;
  margin-top: auto;
  margin-bottom: auto;

  select {
    padding: 4px;
    border: solid 1px ${(props) => props.theme.colors.tenantPrimary};
    color: ${(props) => props.theme.colors.tenantPrimary};
  }

  svg {
    fill: ${(props) => props.theme.colors.tenantPrimary} !important;
    width: 16px;
  }
`;

interface Props {
  option: IOption;
  index: number;
}

const RankingOption = ({ option, index }: Props) => {
  const { formatMessage } = useIntl();
  const theme = useTheme();

  return (
    <li aria-roledescription="sortable">
      <Drag index={index} useBorder={false} id={`ranking-item-${option.value}`}>
        <Box
          style={{ cursor: 'grab' }}
          mb="12px"
          background={theme.colors.tenantPrimaryLighten95}
          borderRadius={theme.borderRadius}
          border={`1px solid ${theme.colors.tenantPrimary}`}
        >
          <Box
            padding="18px 20px 18px 20px"
            display="flex"
            justifyContent="space-between"
          >
            <Box display="flex">
              <ScreenReaderOnly>
                <Label>
                  {`${option.label}. ${
                    getRankOfOption(option)
                      ? formatMessage(messages.currentRank)
                      : formatMessage(messages.noRankSelected)
                  }`}
                </Label>
              </ScreenReaderOnly>

              <StyledSelect
                options={rankDropdownOptions}
                value={getRankOfOption(option)}
                onChange={(selectedOption) => {
                  moveOptionInArray(index, selectedOption.value - 1);

                  // For a11y, focus the list item again after reordering.
                  (
                    document.querySelector(
                      `[data-rbd-drag-handle-draggable-id="ranking-item-${option.value}"]`
                    ) as HTMLElement
                  ).focus();
                }}
              />
              <Text
                maxWidth="80%"
                my="auto"
                color="tenantPrimary"
                p="0px"
                m="0px"
                aria-hidden
              >
                {option.label}
              </Text>
            </Box>

            <Box flexShrink={0} my="auto" pl="8px">
              <Icon
                height="18px"
                name="drag-handle"
                fill={theme.colors.tenantPrimary}
              />
            </Box>
          </Box>
        </Box>
      </Drag>
    </li>
  );
};

export default RankingOption;
