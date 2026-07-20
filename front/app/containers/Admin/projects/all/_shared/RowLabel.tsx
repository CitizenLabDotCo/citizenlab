import React from 'react';

import {
  Box,
  Icon,
  Text,
  colors,
  IconNames,
} from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

interface Props {
  iconName: IconNames;
  titleMultiloc: Multiloc | null;
  underline?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  onHoverChange?: (hovering: boolean) => void;
}

// Icon + title label shown under a row title (e.g. the space or folder the
// row's item belongs to). Interactivity lives on the wrapping Box so the icon
// and the gap are part of the click/hover target, not just the text.
const RowLabel = ({
  iconName,
  titleMultiloc,
  underline = false,
  onClick,
  onHoverChange,
}: Props) => {
  const localize = useLocalize();

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="2px"
      flexShrink={0}
      cursor={onClick || onHoverChange ? 'pointer' : undefined}
      onClick={onClick}
      onMouseEnter={onHoverChange ? () => onHoverChange(true) : undefined}
      onMouseLeave={onHoverChange ? () => onHoverChange(false) : undefined}
    >
      <Icon name={iconName} fill={colors.textSecondary} width="14px" />
      <Text
        m="0"
        fontSize="xs"
        color="textSecondary"
        textDecoration={underline ? 'underline' : 'none'}
      >
        {localize(titleMultiloc)}
      </Text>
    </Box>
  );
};

export default RowLabel;
