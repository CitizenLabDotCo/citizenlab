import React from 'react';
import { STANDARD_PAGES } from 'services/pages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// components
import Link from 'utils/cl-router/Link';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import PageEditor from '../policies/PageEditor';

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

const SLUG_BY_CODE = {
  about: 'information',
  faq: 'faq',
};

const AdminSettingsPages = () => (
  <>
    <SectionTitle>
      <FormattedMessage {...messages.defaultPagesTitle} />
    </SectionTitle>
    <SectionDescription>
      <FormattedMessage
        {...messages.defaultPagesSubtitle}
        values={{
          policiesLink: (
            <StyledLink to="/admin/settings/policies">
              <FormattedMessage {...messages.defaultPagesSubtitleLink} />
            </StyledLink>
          ),
        }}
      />
    </SectionDescription>
    {STANDARD_PAGES.map((code) => (
      <PageEditor key={code} pageSlug={SLUG_BY_CODE[code]} />
    ))}
  </>
);

export default AdminSettingsPages;
