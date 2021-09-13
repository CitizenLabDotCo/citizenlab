import React from 'react';
import { POLICY_PAGES_ALLOWED_TO_EDIT } from 'services/pages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// components
import Link from 'utils/cl-router/Link';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import PageEditor from './PageEditor';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const StyledLink = styled(Link)`
  color: ${colors.adminSecondaryTextColor};
  text-decoration: underline;

  &:hover {
    text-decoration: underline;
  }
`;

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
            <StyledLink to="/admin/settings/pages">
              <FormattedMessage {...messages.policiesSubtitleLink} />
            </StyledLink>
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
