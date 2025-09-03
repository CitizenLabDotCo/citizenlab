import React from 'react';

import {
  Box,
  Button,
  Icon,
  Td,
  Thead,
  Tr,
} from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import { ScreenReaderOnly } from 'utils/a11y';

import { MAXIMUM } from './constants';
import { getSentimentEmoji } from './utils';

export const StyledImg = styled.img`
  padding: 8px;
  border: 1px solid white;
  border-radius: 8px;
  width: 48px;

  &.isSelected {
    border: 1px solid ${({ theme }) => theme.colors.tenantPrimary};
    background-color: ${({ theme }) => theme.colors.tenantPrimaryLighten90};
  }

  &:not(.isSelected):hover {
    background-color: ${({ theme }) => theme.colors.grey100};
    border: 1px solid ${({ theme }) => theme.colors.grey500};
  }
`;

interface Props {
  data?: number;
  id: string;
  getAriaLabel: (value: number, total: number) => string;
  onChange: (data?: number) => void;
  onFocusSliderRef: () => void;
}

const TableHead = ({
  data,
  id,
  getAriaLabel,
  onChange,
  onFocusSliderRef,
}: Props) => {
  const theme = useTheme();

  return (
    <Thead>
      <Tr>
        {[...Array(MAXIMUM).keys()].map((i) => {
          // The currentAnswer is 1-indexed, so it's easier here to add 1 to the mapped
          // index for when we want to compare it to the currently selected value;
          const visualIndex = i + 1;
          const isSelected = data === visualIndex;

          return (
            <Td py="4px" key={`${id}-radio-${visualIndex}`}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Button
                  p="0px"
                  m="0px"
                  id={`${id}-linear-scale-option-${visualIndex}`}
                  aria-pressed={isSelected}
                  width="100%"
                  tabIndex={-1}
                  onClick={() => {
                    if (isSelected) {
                      onChange(undefined);
                    } else {
                      onChange(visualIndex);
                    }
                  }}
                  onFocus={onFocusSliderRef}
                  buttonStyle="text"
                >
                  <ScreenReaderOnly>
                    {getAriaLabel(visualIndex, MAXIMUM)}
                  </ScreenReaderOnly>
                  <Box>
                    {isSelected && (
                      <Box
                        borderRadius="45px"
                        background="white"
                        position="absolute"
                        ml="36px"
                        mt="-10px" // Required for precise positioning
                        aria-hidden
                      >
                        <Icon
                          name="check-circle"
                          fill={theme.colors.tenantPrimary}
                        />
                      </Box>
                    )}

                    <StyledImg
                      src={getSentimentEmoji(visualIndex)}
                      alt=""
                      aria-hidden
                      className={isSelected ? 'isSelected' : ''}
                    />
                  </Box>
                </Button>
              </Box>
            </Td>
          );
        })}
      </Tr>
    </Thead>
  );
};

export default TableHead;
