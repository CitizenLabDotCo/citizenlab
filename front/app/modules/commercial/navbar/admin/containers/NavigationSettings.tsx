import React from 'react';
import { Box } from 'cl2-component-library';

// hooks
import usePages from 'hooks/usePages';
import useNavbarItems from 'hooks/useNavbarItems';

// components
import VisibleNavbarItemList from '../components/NavbarItemList/VisibleNavbarItemList';
import HiddenNavbarItemList from '../components/NavbarItemList/HiddenNavbarItemList';

// utils
import { isNilOrError } from 'utils/helperUtils';
import generateNavbarItems from './generateNavbarItems';

const NavigationSettings = () => {
  const pages = usePages();
  const navbarItems = useNavbarItems();

  if (isNilOrError(pages) || isNilOrError(navbarItems)) return null;

  const { visibleNavbarItems, hiddenNavbarItems } = generateNavbarItems(
    navbarItems,
    pages
  );

  console.log(visibleNavbarItems);

  return (
    <>
      <Box mb="44px">
        <VisibleNavbarItemList
          navbarItems={visibleNavbarItems}
          lockFirstNItems={2}
        />
      </Box>

      <HiddenNavbarItemList navbarItems={hiddenNavbarItems} />
    </>
  );
};

export default NavigationSettings;
