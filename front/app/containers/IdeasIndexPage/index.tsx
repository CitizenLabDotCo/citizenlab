import React, { memo, useState, useCallback } from 'react';

// services
import { ideaDefaultSortMethodFallback } from 'services/participationContexts';

// components
import ContentContainer from 'components/ContentContainer';
import { IdeaCardsWithFiltersSidebar } from 'components/IdeaCards';
import CityLogoSection from 'components/CityLogoSection';
import IdeasIndexMeta from './IdeaIndexMeta';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, fontSizes, colors, isRtl } from 'utils/styleUtils';

// typings
import { IQueryParameters } from 'api/ideas/types';

const Container = styled.main`
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: ${colors.background};

  ${media.tablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  flex: 1 1 auto;
  padding-top: 60px;
  padding-bottom: 100px;

  ${media.phone`
    padding-top: 30px;
  `}
`;

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: normal;
  font-weight: 500;
  text-align: center;
  padding: 0;
  margin: 0;
  margin-bottom: 35px;

  ${media.tablet`
    text-align: left;
    margin-bottom: 20px;
  `}

  ${media.phone`
    font-size: ${fontSizes.xxxl}px;
  `}

 ${isRtl`
  ${media.tablet`
    text-align: right;
  `}
 `}
`;

export default memo(() => {
  const [ideasQueryParameters, setIdeasQueryParameters] =
    useState<IQueryParameters>({
      'page[number]': 1,
      'page[size]': 12,
      sort: ideaDefaultSortMethodFallback,
      project_publication_status: 'published',
    });

  const updateQuery = useCallback((newParams: Partial<IQueryParameters>) => {
    setIdeasQueryParameters((current) => ({ ...current, ...newParams }));
  }, []);

  return (
    <>
      <IdeasIndexMeta />
      <Container>
        <StyledContentContainer maxWidth="100%">
          <PageTitle>
            <FormattedMessage {...messages.inputsPageTitle} />
          </PageTitle>
          <IdeaCardsWithFiltersSidebar
            invisibleTitleMessage={messages.a11y_IdeasListTitle}
            ideaQueryParameters={ideasQueryParameters}
            onUpdateQuery={updateQuery}
          />
        </StyledContentContainer>
        <CityLogoSection />
      </Container>
    </>
  );
});
