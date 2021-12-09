import React, { useState } from 'react';
import { POLICY_PAGES } from 'services/pages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// components
import Link from 'utils/cl-router/Link';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import PageEditor from './PageEditor';
import Outlet from 'components/Outlet';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

export const StyledLink = styled(Link)`
  color: ${colors.adminSecondaryTextColor};
  text-decoration: underline;

  &:hover {
    text-decoration: underline;
  }
`;

const PoliciesTab = () => {
  const [navbarModuleActive, setNavbarModuleActive] = useState(false);
  const setNavbarModuleActiveToTrue = () => setNavbarModuleActive(true);

  return (
    <>
      <Outlet
        id="app.containers.Admin.settings.policies.start"
        onMount={setNavbarModuleActiveToTrue}
      />

      <SectionTitle>
        <FormattedMessage {...messages.policiesTitle} />
      </SectionTitle>
      <SectionDescription>
        <Outlet id="app.containers.Admin.settings.policies.subTitle" />

        {!navbarModuleActive && (
          <FormattedMessage
            {...messages.policiesSubtitleFree}
            values={{
              pagesLink: (
                <StyledLink to="/admin/settings/pages">
                  <FormattedMessage {...messages.linkToPages} />
                </StyledLink>
              ),
            }}
          />
        )}
      </SectionDescription>
      {POLICY_PAGES.map((slug) => (
        <PageEditor key={slug} pageSlug={slug} />
      ))}
    </>
  );
};

export default PoliciesTab;
