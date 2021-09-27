import React from 'react';
import styled from 'styled-components';
import { LEGAL_PAGES, TLegalPage } from 'services/pages';
import {
  StyledContentContainer,
  StyledLink,
  LinkIcon,
} from 'containers/PagesShowPage';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const PagesNav = styled.nav`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between;
  list-style: none;
  margin: 0 auto;
  padding-top: 90px;
  padding-bottom: 80px;
`;

interface Props {
  currentPageSlug: string;
}

const PagesFooterNavigation = ({ currentPageSlug }: Props) => {
  return (
    <PagesNav>
      <StyledContentContainer>
        {LEGAL_PAGES.filter((pageSlug) => pageSlug !== currentPageSlug).map(
          (pageSlug: TLegalPage) => (
            <StyledLink
              className={`e2e-page-link-to-${pageSlug}`}
              to={`/pages/${pageSlug}`}
              key={pageSlug}
            >
              <FormattedMessage
                {...{
                  information: messages.informationPageName,
                  'terms-and-conditions': messages.termsAndConditionsPageName,
                  'privacy-policy': messages.privacyPolicyPageName,
                  'cookie-policy': messages.cookiePolicyPageName,
                  'accessibility-statement':
                    messages.accessibilityStatementPageName,
                  faq: messages.faqPageName,
                }[pageSlug]}
              />
              <LinkIcon name="chevron-right" />
            </StyledLink>
          )
        )}
      </StyledContentContainer>
    </PagesNav>
  );
};

export default PagesFooterNavigation;
