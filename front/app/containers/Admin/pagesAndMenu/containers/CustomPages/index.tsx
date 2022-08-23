import React from 'react';

// components
import HelmetIntl from 'components/HelmetIntl';
import { Outlet as RouterOutlet } from 'react-router-dom';

// i18n
import messages from './messages';

const CustomPages = () => {
  return (
    <>
      <HelmetIntl
        title={messages.metaTitle}
        description={messages.metaDescription}
      />
      <RouterOutlet />
    </>
  );
};

export default CustomPages;
