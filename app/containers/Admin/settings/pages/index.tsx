import React, { PureComponent } from 'react';
import { LEGAL_PAGES } from 'services/pages';
import PageEditor from './PageEditor';

export default class AdminSettingsPages extends PureComponent {
  render() {
    return (
      <>
        {LEGAL_PAGES.map((slug, index) => (
          <PageEditor
            key={slug}
            slug={slug}
            isLast={(index === LEGAL_PAGES.length - 1)}
          />
        ))}
      </>
    );
  }
}
