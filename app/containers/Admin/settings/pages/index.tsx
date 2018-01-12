import * as React from 'react';
import { LEGAL_PAGES } from 'services/pages';
import PageEditor from './PageEditor';

export default class AdminSettingsPages extends React.PureComponent {
  render() {
    return (
      <>
        {LEGAL_PAGES.map((slug) => (
          <PageEditor key={slug} slug={slug} />
        ))}
      </>
    );
  }
}
