import React, { Suspense, lazy, useState } from 'react';

import { trackEventByName } from 'utils/analytics';

import tracks from '../../../../tracks';
import ShowFullMenuButton from '../ShowFullMenuButton';
const FullMobileNavMenu = lazy(() => import('../FullMobileNavMenu'));

const ButtonWithFullMobileNavMenu = () => {
  const [isFullMenuOpened, setIsFullMenuOpened] = useState(false);

  const openMenu = () => {
    setIsFullMenuOpened(true);
    trackEventByName(tracks.moreButtonClickedFullMenuOpened);
  };

  const closeMenu = () => {
    setIsFullMenuOpened(false);
    trackEventByName(tracks.moreButtonClickedFullMenuClosed);
  };

  return (
    <>
      <ShowFullMenuButton onClick={openMenu} />
      <Suspense fallback={null}>
        <FullMobileNavMenu
          isFullMenuOpened={isFullMenuOpened}
          onClose={closeMenu}
        />
      </Suspense>
    </>
  );
};

export default ButtonWithFullMobileNavMenu;
