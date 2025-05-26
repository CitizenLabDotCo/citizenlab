import React from 'react';

import {
  Box,
  Button,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@citizenlab/cl2-component-library';

import { ScreenReaderOnly } from 'utils/a11y';
import { useTheme } from 'styled-components';

const TableHead = () => {
  const theme = useTheme();

  return (
    <Thead>
      <Tr>
        {[...Array(maximum).keys()].map((i) => {
          // The currentAnswer is 1-indexed, so it's easier here to add 1 to the mapped
          // index for when we want to compare it to the currently selected value;
          const visualIndex = i + 1;
          const isSelected = currentAnswer === visualIndex;

          return (
            <Td py="4px" key={`${path}-radio-${visualIndex}`}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Button
                  p="0px"
                  m="0px"
                  id={`${path}-linear-scale-option-${visualIndex}`}
                  aria-pressed={isSelected}
                  width="100%"
                  tabIndex={-1}
                  onClick={() => {
                    if (isSelected) {
                      // Clear data from this question and any follow-up question
                      handleChange(path, undefined);
                      handleChange(`${path}_follow_up`, undefined);
                    } else {
                      handleChange(path, visualIndex);
                    }
                  }}
                  onFocus={() => {
                    sliderRef.current?.focus();
                  }}
                  buttonStyle="text"
                >
                  <ScreenReaderOnly>
                    {getAriaLabel(visualIndex, maximum)}
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
