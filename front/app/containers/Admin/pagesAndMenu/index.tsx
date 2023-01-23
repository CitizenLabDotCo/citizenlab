import React from 'react';
import messages from './messages';
import HelmetIntl from 'components/HelmetIntl';
import PagesMenu from './containers/PagesMenu';

const PagesAndMenuIndex = () => {
  return (
    <>
      <HelmetIntl title={messages.pagesMenuMetaTitle} />
      <div id="e2e-pages-menu-container">
        <PagesMenu />
      </div>
    </>
  );
};

export default PagesAndMenuIndex;
