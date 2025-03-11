import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { EDITABLE_POLICY_PAGES } from 'api/custom_pages/types';

import pagesAndMenuMessages from 'containers/Admin/pagesAndMenu/messages';

import { SectionTitle, SectionDescription } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';
import PageEditor from './PageEditor';

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
      {EDITABLE_POLICY_PAGES.map((slug) => (
        <PageEditor key={slug} pageSlug={slug} />
      ))}
    </>
  );
};

export default PoliciesTab;
