import React from 'react';

import {
  Box,
  Button,
  IconNames,
  Tooltip,
  bo,
  colors,
  defaultStyles,
  fontSizes,
} from '@citizenlab/cl2-component-library';

interface ModeToggleOption<T extends string> {
  value: T;
  label: string;
  icon?: IconNames;
  disabled?: boolean;
  tooltip?: string;
  dataCy?: string;
}

type Size = 's' | 'm';

interface Geometry {
  display: 'flex' | 'inline-flex';
  trackPadding: string;
  padding: string;
  gap?: string;
  height?: string;
  fontSize?: string;
  fontWeight?: string;
  iconSize?: string;
}

const SIZES: Record<Size, Geometry> = {
  s: {
    display: 'inline-flex',
    trackPadding: '2px',
    gap: '2px',
    height: '28px',
    padding: '0 14px',
    fontSize: `${fontSizes.xs}px`,
    fontWeight: '500',
    iconSize: '14px',
  },
  m: {
    display: 'flex',
    trackPadding: '4px',
    padding: '8px',
  },
};

interface Props<T extends string> {
  options: ModeToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size: Size;
}

const ModeToggle = <T extends string>({
  options,
  value,
  onChange,
  size,
}: Props<T>) => {
  const geometry = SIZES[size];

  return (
    <Box
      display={geometry.display}
      gap={geometry.gap}
      p={geometry.trackPadding}
      borderRadius={bo.borderRadius}
      background={colors.grey100}
    >
      {options.map((option) => {
        const selected = option.value === value;

        const textColor = selected
          ? bo.colors.textHeadingStrong
          : colors.textSecondary;
        const bgColor = selected ? colors.white : 'transparent';

        return (
          <Box key={option.value} flex="1">
            <Tooltip
              content={option.tooltip}
              placement="bottom"
              disabled={!option.tooltip}
            >
              <Button
                buttonStyle="text"
                fullWidth
                onClick={() => onChange(option.value)}
                icon={option.icon}
                iconSize={geometry.iconSize}
                height={geometry.height}
                padding={geometry.padding}
                borderRadius="6px"
                fontSize={geometry.fontSize}
                fontWeight={geometry.fontWeight}
                whiteSpace="nowrap"
                bgColor={bgColor}
                bgHoverColor={bgColor}
                boxShadow={selected ? defaultStyles.boxShadow : 'none'}
                textColor={textColor}
                textHoverColor={bo.colors.textHeadingStrong}
                iconColor={textColor}
                iconHoverColor={bo.colors.textHeadingStrong}
                disabled={option.disabled}
                data-cy={option.dataCy}
              >
                {option.label}
              </Button>
            </Tooltip>
          </Box>
        );
      })}
    </Box>
  );
};

export default ModeToggle;
