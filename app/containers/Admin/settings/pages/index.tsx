import React, { PureComponent } from 'react';
import { LEGAL_PAGES } from 'services/pages';
import PageEditor from './PageEditor';

export default class AdminSettingsPages extends PureComponent {
  render() {
    return (
      <>
        {LEGAL_PAGES.map((slug) => (
          <PageEditor
            id={slug}
            key={slug}
            slug={slug}
          />
        ))}
      </>
    );
  }
}
