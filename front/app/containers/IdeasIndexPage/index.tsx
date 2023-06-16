import React, { memo, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

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
import { IQueryParameters, Sort } from 'api/ideas/types';
import { QueryParametersUpdate } from 'components/IdeaCards/IdeasWithFiltersSidebar';

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

const parseSearchParams = (newParams: QueryParametersUpdate) => {
  const searchParams: Record<string, string> = {};

  for (const key in newParams) {
    const value = newParams[key];
    if (value) searchParams[key] = JSON.stringify(value);
  }

  return searchParams;
};

export default memo(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sortParam = searchParams.get('sort');
  const searchParam = searchParams.get('search');
  const ideaStatusParam = searchParams.get('idea_status');
  const topicsParam = searchParams.get('topics');

  const ideasQueryParameters = useMemo<IQueryParameters>(
    () => ({
      'page[number]': 1,
      'page[size]': 12,
      sort: (sortParam as Sort) ?? 'trending',
      project_publication_status: 'published',
      publication_status: 'published',
      search: searchParam ?? undefined,
      idea_status: ideaStatusParam ?? undefined,
      topics: topicsParam ? JSON.parse(topicsParam) : undefined,
    }),
    [sortParam, searchParam, ideaStatusParam, topicsParam]
  );

  const updateQuery = useCallback(
    (newParams: QueryParametersUpdate) => {
      setSearchParams(parseSearchParams(newParams));
    },
    [setSearchParams]
  );

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
