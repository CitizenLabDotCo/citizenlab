import React from 'react';

import { colors, Box, Title } from '@citizenlab/cl2-component-library';

import CloseIconButton from 'components/UI/CloseIconButton';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onClose: () => void;
}

const TopBar = ({ onClose }: Props) => {
  return (
    <Box
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
      <CloseIconButton
        a11y_buttonActionMessage={messages.a11y_closeFilterPanel}
        onClick={onClose}
        iconColor={colors.textSecondary}
        iconColorOnHover={'#000'}
      />
    </Box>
  );
};

export default TopBar;
