import React from 'react';

// components
import { SubSectionTitle } from 'components/admin/Section';
import { Box } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

interface Props {
  itemsNotInNavbarPresent: boolean;
}

const Header = ({ itemsNotInNavbarPresent }: Props) => (
  <Box display="flex" justifyContent="space-between" mb="17px">
    {itemsNotInNavbarPresent && (
      <SubSectionTitle>
        <FormattedMessage {...messages.hiddenFromNavigation} />
      </SubSectionTitle>
    )}
  </Box>
);

export default Header;
