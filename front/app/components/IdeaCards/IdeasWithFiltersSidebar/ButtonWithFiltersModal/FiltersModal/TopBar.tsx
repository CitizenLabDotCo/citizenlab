import React, { MouseEvent } from 'react';

import {
  colors,
  Box,
  Button,
  fontSizes,
  Title,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import CloseIconButton from 'components/UI/CloseIconButton';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onClose: () => void;
  onReset: (event: MouseEvent) => void;
}

const TopBar = ({ onClose, onReset }: Props) => {
  const theme = useTheme();

  return (
    <Box
      height={`${theme.mobileTopBarHeight}px`}
      bgColor={colors.white}
      borderBottom={`1px solid ${colors.grey300}`}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px="16px"
    >
      <Title
        as="h2"
        variant="h5"
        fontWeight="bold"
        // CloseIconButton has margin or padding on the right,
        // which makes the px from Box above look assymetical
        // This ml visually corrects this.
        ml="8px"
      >
        <FormattedMessage {...messages.filters} />
      </Title>
      <Box display="flex">
        <Button
          onClick={onReset}
          buttonStyle="text"
          fontSize={`${fontSizes.s}px`}
        >
          <FormattedMessage {...messages.resetFilters} />
        </Button>
        <CloseIconButton
          a11y_buttonActionMessage={messages.a11y_closeFilterPanel}
          onClick={onClose}
          iconColor={colors.textSecondary}
          iconColorOnHover={'#000'}
        />
      </Box>
    </Box>
  );
};

export default TopBar;
