import React from 'react';

import {
  Box,
  Icon,
  IOption,
  Label,
  Text,
  Select,
} from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import { Drag } from 'components/FormBuilder/components/DragAndDrop';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

const StyledSelect = styled(Select)`
  min-width: 52px;
  margin-right: 12px;
  margin-top: auto;
  margin-bottom: auto;

  select {
    padding: 4px;
    border: solid 1px ${(props) => props.theme.colors.borderDark};
    color: ${(props) => props.theme.colors.textPrimary};
  }

  svg {
    fill: ${(props) => props.theme.colors.borderDark} !important;
    width: 16px;
  }
`;

const StyledBox = styled(Box)`
  :hover {
    box-shadow: 0 0 0 1px ${(props) => props.theme.colors.borderDark};
  }
`;

interface Props {
  data?: string[];
  option: IOption;
  options: IOption[];
  index: number;
  moveOptionInArray: (sourceIndex: number, destinationIndex: number) => void;
}

const RankingOption = ({
  data,
  option,
  options,
  index,
  moveOptionInArray,
}: Props) => {
  const { formatMessage } = useIntl();
  const theme = useTheme();

  // getRankOfOption: Function to get the rank of a specific option in the current options array.
  const getRankOfOption = (currentOption: IOption) => {
    return data
      ? options.findIndex(
          (option: IOption) => option.value === currentOption.value
        ) + 1
      : '';
  };

  // rankDropdownOptions: For the select dropdown, generate the rank number options.
  const rankDropdownOptions = options.map(
    (_option: IOption, index: number) => ({
      value: index + 1,
      label: `${index + 1}`,
    })
  );

  return (
    <li aria-roledescription="sortable">
      <Drag index={index} useBorder={false} id={`ranking-item-${option.value}`}>
        <StyledBox
          style={{ cursor: 'grab' }}
          mb="12px"
          borderRadius={theme.borderRadius}
          border={`1px solid ${theme.colors.borderDark}`}
        >
          <StyledBox
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
                height="auto"
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
                color="textPrimary"
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
                fill={theme.colors.textPrimary}
              />
            </Box>
          </StyledBox>
        </StyledBox>
      </Drag>
    </li>
  );
};

export default RankingOption;
