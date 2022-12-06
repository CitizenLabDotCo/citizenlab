import React from 'react';
import { POLICY_PAGES } from 'services/customPages';
// intl
import { FormattedMessage } from 'utils/cl-intl';
// components
import Link from 'utils/cl-router/Link';
import { colors } from 'utils/styleUtils';
import pagesAndMenuMessages from 'containers/Admin/pagesAndMenu/messages';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
// styling
import styled from 'styled-components';
import PageEditor from './PageEditor';
import messages from './messages';

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
