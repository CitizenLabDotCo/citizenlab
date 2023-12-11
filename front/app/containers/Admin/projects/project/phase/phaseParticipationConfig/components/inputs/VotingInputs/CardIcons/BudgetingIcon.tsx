import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

const BudgetingIcon = ({ selected }: { selected: boolean }) => {
  const bgColor = selected ? colors.teal200 : colors.grey500;

  return (
    <Box display="flex">
      <Box bgColor={bgColor} borderRadius="4px" pt="2px" px="5px">
        <svg
          width="22"
          height="20"
          viewBox="0 0 20 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.20711 9.11152C0.816582 8.721 0.816583 8.08784 1.20711 7.69731L7.69729 1.20713C8.08782 0.816602 8.72098 0.816601 9.11151 1.20713L18.7635 10.8591C19.154 11.2496 19.154 11.8828 18.7635 12.2733L15.8113 15.2255C15.6237 15.413 15.3694 15.5184 15.1041 15.5184L11.6621 15.5184L8.02817 15.5184C7.76296 15.5184 7.5086 15.413 7.32107 15.2255L1.20711 9.11152Z"
            fill="white"
          />
          <path
            d="M2.07648 7.93568L1.22317 7.08237L1.86315 6.44238L0.61163 5.19086L1.46494 4.33755L3.88266 6.75527L4.92086 5.71707L3.05779 3.85401C2.91557 3.71179 2.83261 3.53875 2.80891 3.33491C2.7852 3.13106 2.84976 2.95273 3.00257 2.79992L4.62053 1.18196C4.77334 1.02915 4.96352 0.952744 5.19107 0.952744C5.41862 0.952744 5.60351 1.02385 5.74572 1.16607L6.4426 1.86294L7.08258 1.22296L7.93589 2.07627L7.29591 2.71626L8.4621 3.88245L7.60879 4.73576L5.19107 2.31804L4.20976 3.29935L6.14394 5.23353C6.28615 5.37575 6.34778 5.54641 6.32882 5.74551C6.30986 5.94462 6.22332 6.12123 6.0692 6.27535L4.43731 7.90724C4.29509 8.04946 4.12206 8.13242 3.91821 8.15612C3.71437 8.17982 3.54133 8.12057 3.39912 7.97835L2.71647 7.2957L2.07648 7.93568Z"
            fill={bgColor}
            transform="translate(5,5)"
          />
        </svg>
      </Box>
      <Box
        bgColor={bgColor}
        opacity={0.5}
        borderRadius="4px"
        w="32px"
        h="26px"
        ml="4px"
      />
      <Box
        bgColor={bgColor}
        opacity={0.5}
        borderRadius="4px"
        w="32px"
        h="26px"
        ml="4px"
      />
    </Box>
  );
};

export default BudgetingIcon;
