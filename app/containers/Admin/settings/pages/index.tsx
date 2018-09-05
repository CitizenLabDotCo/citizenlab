import React, { PureComponent } from 'react';
import { LEGAL_PAGES } from 'services/pages';
import PageEditor from './PageEditor';
import FileUploader from './FileUploader';

export default class AdminSettingsPages extends PureComponent {
  render() {
    return (
      <>
        {LEGAL_PAGES.map((slug) => (
          <PageEditor
            key={slug}
            slug={slug}
          />
        ))}
        <FileUploader />
      </>
    );
  }
}
