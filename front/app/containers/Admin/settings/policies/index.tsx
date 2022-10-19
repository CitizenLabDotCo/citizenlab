import React from 'react';
import { POLICY_PAGES } from 'services/customPages';

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
import pagesAndMenuMessages from 'containers/Admin/pagesAndMenu/messages';

export const StyledLink = styled(Link)`
  color: ${colors.textSecondary};
  text-decoration: underline;

  &:hover {
    text-decoration: underline;
  }
`;

const PoliciesTab = () => {
  return (
    <>
      <SectionTitle>
        <FormattedMessage {...messages.policiesTitle} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage
          {...messages.policiesSubtitle}
          values={{
            navigationLink: (
              <StyledLink to="/admin/pages-menu">
                <FormattedMessage {...pagesAndMenuMessages.pagesAndMenuTitle} />
              </StyledLink>
            ),
          }}
        />
      </SectionDescription>
      {POLICY_PAGES.map((slug) => (
        <PageEditor key={slug} pageSlug={slug} />
      ))}
    </>
  );
};

export default PoliciesTab;
