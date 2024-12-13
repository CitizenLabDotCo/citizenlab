import React, { Suspense, lazy, useState } from 'react';

import { trackEventByName } from 'utils/analytics';

import tracks from '../../../../tracks';
import ShowFullMenuButton from '../ShowFullMenuButton';
const FullMobileNavMenu = lazy(() => import('../FullMobileNavMenu'));

const ButtonWithFullMobileNavMenu = () => {
  const [isFullMenuOpened, setIsFullMenuOpened] = useState(false);

  const toggleFullMenu = () => {
    setIsFullMenuOpened(!isFullMenuOpened);
    trackEventByName(
      isFullMenuOpened
        ? tracks.moreButtonClickedFullMenuOpened
        : tracks.moreButtonClickedFullMenuClosed
    );
  };

  return (
    <>
      <ShowFullMenuButton onClick={toggleFullMenu} />
      <Suspense fallback={null}>
        <FullMobileNavMenu
          isFullMenuOpened={isFullMenuOpened}
          onClose={toggleFullMenu}
        />
      </Suspense>
    </>
  );
};

export default ButtonWithFullMobileNavMenu;
