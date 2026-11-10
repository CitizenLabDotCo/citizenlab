import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import LanguageSelector from 'containers/MainHeader/Components/LanguageSelector';

import WeglotSwitcher from 'components/WeglotSwitcher';

// The form pages hide the navbar, so its platform language selector and the
// Weglot switcher are shown in the form's own bottom bar instead. Both open
// upwards, as they sit at the bottom of the screen.
const FormLanguageSwitchers = () => (
  <Box display="flex" alignItems="center" gap="12px">
    <LanguageSelector
      dropdownClassName={'open-upwards'}
      useDefaultTop={false}
      mobileRight="auto"
      mobileLeft="auto"
      right="auto"
      afterSelection={() => {
        window.location.reload();
      }}
    />
    <WeglotSwitcher openUpwards />
  </Box>
);

export default FormLanguageSwitchers;
