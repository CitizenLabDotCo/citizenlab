import React from 'react';
import { FIXED_PAGES_ALLOWED_TO_EDIT } from 'services/pages';
import PageEditor from '../policies/PageEditor';
import { SectionTitle, SectionDescription } from 'components/admin/Section';

// components
import Link from 'utils/cl-router/Link';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const AdminSettingsPages = () => (
  <>
    <SectionTitle>
      <FormattedMessage {...messages.fixedPagesTitle} />
    </SectionTitle>
    <SectionDescription>
      <FormattedMessage
        {...messages.fixedPagesSubtitle}
        values={{
          policiesLink: (
            <Link to="/admin/settings/policies">
              <FormattedMessage {...messages.fixedPagesSubtitleLink} />
            </Link>
          ),
        }}
      />
    </SectionDescription>
    {FIXED_PAGES_ALLOWED_TO_EDIT.map((slug) => (
      <PageEditor key={slug} slug={slug} />
    ))}
  </>
);

export default AdminSettingsPages;
