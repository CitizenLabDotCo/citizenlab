import React from 'react';
import styled from 'styled-components';
import { LEGAL_PAGES, LegalPages } from 'services/pages';
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
  currentPageSlug: LegalPages;
}

const PagesFooterNavigation = ({ currentPageSlug }: Props) => {
  return (
    <PagesNav>
      <StyledContentContainer>
        {LEGAL_PAGES.filter((pageSlug) => pageSlug !== currentPageSlug).map(
          (pageSlug) => (
            <StyledLink to={`/pages/${pageSlug}`} key={pageSlug}>
              <FormattedMessage {...messages[`${pageSlug}PageName`]} />
              <LinkIcon name="chevron-right" />
            </StyledLink>
          )
        )}
      </StyledContentContainer>
    </PagesNav>
  );
};

export default PagesFooterNavigation;
