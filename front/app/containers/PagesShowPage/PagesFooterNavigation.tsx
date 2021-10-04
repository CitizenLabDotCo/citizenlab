import React from 'react';
import styled from 'styled-components';
import { FOOTER_PAGES } from 'services/pages';
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
        {FOOTER_PAGES.filter((pageSlug) => pageSlug !== currentPageSlug).map(
          (pageSlug) => {
            const message = {
              information: messages.informationPageName,
              'terms-and-conditions': messages.termsAndConditionsPageName,
              'privacy-policy': messages.privacyPolicyPageName,
              'cookie-policy': messages.cookiePolicyPageName,
              'accessibility-statement':
                messages.accessibilityStatementPageName,
              faq: messages.faqPageName,
            }[pageSlug];

            if (message) {
              return (
                <StyledLink
                  className={`e2e-page-link-to-${pageSlug}`}
                  to={`/pages/${pageSlug}`}
                  key={pageSlug}
                >
                  <FormattedMessage {...message} />
                  <LinkIcon name="chevron-right" />
                </StyledLink>
              );
            }

            return null;
          }
        )}
      </StyledContentContainer>
    </PagesNav>
  );
};

export default PagesFooterNavigation;
