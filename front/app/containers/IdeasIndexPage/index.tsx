import React, { useMemo } from 'react';

import {
  media,
  fontSizes,
  colors,
  isRtl,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IdeaQueryParameters } from 'api/ideas/types';
import { IdeaSortMethod } from 'api/phases/types';

import CityLogoSection from 'components/CityLogoSection';
import ContentContainer from 'components/ContentContainer';
import IdeasWithFiltersSidebar from 'components/IdeaCards/IdeasWithFiltersSidebar';
import IdeaListScrollAnchor from 'components/IdeaListScrollAnchor';

import { FormattedMessage } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { useSearch } from 'utils/router';

import IdeasIndexMeta from './IdeaIndexMeta';
import messages from './messages';

const Container = styled.div`
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

const IdeasIndexPage = () => {
  const [searchParams] = useSearch({ strict: false });
  const sortParam = searchParams.get('sort') as IdeaSortMethod | null;
  const searchParam = searchParams.get('search');
  const ideaStatusParam = searchParams.get('idea_status');
  const topicsParam = searchParams.get('topics');

  const ideasQueryParameters = useMemo<IdeaQueryParameters>(
    () => ({
      'page[number]': 1,
      'page[size]': 12,
      project_publication_status: 'published',
      publication_status: 'published',
      sort: sortParam ?? 'trending',
      search: searchParam ?? undefined,
      idea_status: ideaStatusParam ?? undefined,
      input_topics: topicsParam ? JSON.parse(topicsParam) : undefined,
      transitive: true,
    }),
    [sortParam, searchParam, ideaStatusParam, topicsParam]
  );

  return (
    <>
      <IdeasIndexMeta />
      <main>
        <Container>
          <StyledContentContainer maxWidth="100%">
            <PageTitle>
              <FormattedMessage {...messages.inputsPageTitle} />
            </PageTitle>
            {/* Needed to add an anchor here so that we can scroll up the page correctly
                when fitlers are changed in the IdeaCardsWithFiltersSidebar component and scrollToTopIdeasList util.
            */}
            <IdeaListScrollAnchor />
            <IdeasWithFiltersSidebar
              ideaQueryParameters={ideasQueryParameters}
              onUpdateQuery={updateSearchParams}
            />
          </StyledContentContainer>
          <CityLogoSection />
        </Container>
      </main>
    </>
  );
};

export default IdeasIndexPage;
