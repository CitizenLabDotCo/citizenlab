import React, { PureComponent } from 'react';
import { LEGAL_PAGES_ALLOWED_TO_EDIT } from 'services/pages';
import PageEditor from './PageEditor';
import { SectionTitle, SectionDescription } from 'components/admin/Section';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

export default class Policies extends PureComponent {
  render() {
    return (
      <>
        <SectionTitle>
          <FormattedMessage {...messages.platformPolicies} />
        </SectionTitle>
        <SectionDescription>
          <FormattedMessage {...messages.platformPoliciesText} />
        </SectionDescription>
        {LEGAL_PAGES_ALLOWED_TO_EDIT.map((slug) => (
          <PageEditor key={slug} slug={slug} />
        ))}
      </>
    );
  }
}
