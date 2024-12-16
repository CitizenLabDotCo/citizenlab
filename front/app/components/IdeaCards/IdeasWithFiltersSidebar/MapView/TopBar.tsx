import React from 'react';

import { colors, Box, Title } from '@citizenlab/cl2-component-library';

import CloseIconButton from 'components/UI/CloseIconButton';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../ButtonWithFiltersModal/FiltersModal/messages';

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
      justifyContent="center"
      position="relative"
    >
      <Title as={'h2'} variant={'h5'} m="0" p="16px" fontWeight="bold">
        <FormattedMessage {...messages.filters} />
      </Title>
      <Box position="absolute" right="8px">
        <CloseIconButton
          a11y_buttonActionMessage={messages.a11y_closeFilterPanel}
          onClick={onClose}
          iconColor={colors.textSecondary}
          iconColorOnHover={colors.grey800}
        />
      </Box>
    </Box>
  );
};

export default TopBar;
