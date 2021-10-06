import React from 'react';
import { Box } from 'cl2-component-library';

// hooks
import usePages from 'hooks/usePages';
import useNavbarItems from 'hooks/useNavbarItems';

// components
import NavbarItemList from '../components/NavbarItemList';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import generateNavbarItems from './generateNavbarItems';
import {
  getDisplaySettingsVisibleItem,
  getDisplaySettingsOtherItem,
} from './getDisplaySettings';

const NavigationSettings = () => {
  const pages = usePages();
  const navbarItems = useNavbarItems();

  if (isNilOrError(pages) || isNilOrError(navbarItems)) return null;

  const { visibleNavbarItems, otherNavbarItems } = generateNavbarItems(
    navbarItems,
    pages
  );

  return (
    <>
      <Box mb="44px">
        <NavbarItemList
          title={<FormattedMessage {...messages.navigationItems} />}
          navbarItems={visibleNavbarItems}
          getDisplaySettings={getDisplaySettingsVisibleItem}
          sortable={true}
          lockFirstNItems={2}
        />
      </Box>

      <NavbarItemList
        title={<FormattedMessage {...messages.hiddenFromNavigation} />}
        navbarItems={otherNavbarItems}
        getDisplaySettings={getDisplaySettingsOtherItem}
      />
    </>
  );
};

export default NavigationSettings;
