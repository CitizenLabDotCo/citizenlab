import React from 'react';
import messages from './messages';
import Outlet from 'components/Outlet';
import HelmetIntl from 'components/HelmetIntl';

const PagesAndMenuIndex = () => {
  return (
    <>
      <HelmetIntl title={messages.pagesMenuMetaTitle} />
      <div id="e2e-pages-menu-container">
        <Outlet id="app.containers.Admin.pages-menu.index" />
      </div>
    </>
  );
};

export default PagesAndMenuIndex;
