import React from 'react';

// components
import { SubSectionTitle } from 'components/admin/Section';
import Button from 'components/UI/Button';
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

    <Button
      buttonStyle="cl-blue"
      linkTo="/admin/pages-menu/pages/new"
      className="intercom-admin-pages-menu-add-page"
    >
      <FormattedMessage {...messages.addPageButton} />
    </Button>
  </Box>
);

export default Header;
