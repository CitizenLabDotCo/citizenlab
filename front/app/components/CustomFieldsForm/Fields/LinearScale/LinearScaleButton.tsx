import React from 'react';

import {
  Box,
  Button,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { IFlatCustomField } from 'api/custom_fields/types';

interface Props {
  question: IFlatCustomField;
  visualIndex: number;
  data?: number;
  maximum: number;
  onSelect: (value: number) => void;
}

const LinearScaleButton = ({
  question,
  visualIndex,
  data,
  maximum,
  onSelect,
}: Props) => {
  const theme = useTheme();
  const isSmallerThanPhone = useBreakpoint('phone');

  const name = question.key;

  const getButtonWidth = () => {
    if (isSmallerThanPhone) {
      return `calc(100% / ${maximum > 5 ? 4 : maximum} - 8px)`; // Fit 4 buttons per row on small screens
    }
    return `calc(100% / ${maximum} - 8px)`; // Fit all buttons on one row for larger screens
  };

  return (
    <Box
      flexBasis={100 / maximum}
      key={`${name}-radio-${visualIndex}`}
      minWidth={getButtonWidth()}
      padding="16px, 20px, 16px, 20px"
    >
      <Button
        py="12px"
        id={`linear-scale-option-${visualIndex}`}
        tabIndex={-1}
        aria-pressed={data === visualIndex}
        borderColor={theme.colors.tenantPrimary}
        borderHoverColor={theme.colors.tenantPrimary}
        bgColor={
          data === visualIndex
            ? theme.colors.tenantPrimary
            : theme.colors.tenantPrimaryLighten95
        }
        bgHoverColor={
          data === visualIndex
            ? theme.colors.tenantPrimary
            : theme.colors.tenantPrimaryLighten75
        }
        textHoverColor={
          data === visualIndex ? colors.white : theme.colors.tenantPrimary
        }
        textColor={
          data === visualIndex ? colors.white : theme.colors.tenantPrimary
        }
        width="100%"
        onClick={() => onSelect(visualIndex)}
      >
        {visualIndex}
      </Button>
    </Box>
  );
};

export default LinearScaleButton;
