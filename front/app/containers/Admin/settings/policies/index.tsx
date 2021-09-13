import React from 'react';
import { POLICY_PAGES_ALLOWED_TO_EDIT } from 'services/pages';
import PageEditor from './PageEditor';
import { SectionTitle, SectionDescription } from 'components/admin/Section';

// components
import Link from 'utils/cl-router/Link';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const AdminSettingsPages = () => (
  <>
    <SectionTitle>
      <FormattedMessage {...messages.policiesTitle} />
    </SectionTitle>
    <SectionDescription>
      <FormattedMessage
        {...messages.policiesSubtitle}
        values={{
          pagesLink: (
            <Link to="/admin/settings/pages">
              <FormattedMessage {...messages.policiesSubtitleLink} />
            </Link>
          ),
        }}
      />
    </SectionDescription>
    {POLICY_PAGES_ALLOWED_TO_EDIT.map((slug) => (
      <PageEditor key={slug} slug={slug} />
    ))}
  </>
);

export default AdminSettingsPages;
