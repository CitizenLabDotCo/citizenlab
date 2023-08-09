import React, { useState, useContext, memo, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { PreviousPathnameContext } from 'context';

// router
import { useParams, useSearchParams } from 'react-router-dom';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

// components
import { IdeaCardsWithoutFiltersSidebar } from 'components/IdeaCards';
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import ContentContainer from 'components/ContentContainer';
import UsersShowPageMeta from './UsersShowPageMeta';
import Button from 'components/UI/Button';
import Following from './Following';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useUserBySlug from 'api/users/useUserBySlug';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useUserIdeasCount from 'api/user_ideas_count/useUserIdeasCount';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import UserHeader from './UserHeader';
import UserNavbar from './UserNavbar';
import UserComments from './UserComments';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
import Unauthorized from 'components/Unauthorized';

// utils
import { isError } from 'utils/helperUtils';
import { ideaDefaultSortMethodFallback } from 'services/participationContexts';

// typings
import { IUserData } from 'api/users/types';
import { Sort } from 'components/IdeaCards/shared/Filters/SortFilterDropdown';

const NotFoundContainer = styled.main`
  min-height: calc(100vh - ${(props) => props.theme.menuHeight}px - 1px - 4rem);
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 4rem;
  font-size: ${fontSizes.l}px;
  color: ${colors.textSecondary};
`;

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
  padding-top: 70px;
  padding-bottom: 100px;
  background: ${colors.background};
  align-items: center;

  ${media.phone`
    padding-top: 50px;
  `}
`;

export type UserTab = 'ideas' | 'comments' | 'following';

interface InnerProps {
  className?: string;
  user: IUserData;
}

interface QueryParameters {
  // constants
  'page[number]': number;
  'page[size]': number;
  author: string;

  // filters
  search?: string;
  sort: Sort;
}

export const UsersShowPage = memo<InnerProps>(({ className, user }) => {
  const [currentTab, setCurrentTab] = useState<UserTab>('ideas');
  const [savedScrollIndex, setSavedScrollIndex] = useState<number>(0);
  const isFollowingEnabled = useFeatureFlag({
    name: 'follow',
  });
  const isSmallerThanPhone = useBreakpoint('phone');
  const { data: ideasCount } = useUserIdeasCount({ userId: user.id });
  const [searchParams] = useSearchParams();
  const sortParam = searchParams.get('sort') as Sort | null;
  const searchParam = searchParams.get('search');
  const { formatMessage } = useIntl();

  const ideaQueryParameters = useMemo<QueryParameters>(
    () => ({
      'page[number]': 1,
      'page[size]': 24,
      author: user.id,
      sort: sortParam ?? ideaDefaultSortMethodFallback,
      search: searchParam ?? undefined,
    }),
    [user, sortParam, searchParam]
  );

  const changeTab = (toTab: UserTab) => () => {
    const oldScroll = savedScrollIndex;
    setCurrentTab(toTab);
    setSavedScrollIndex(window.pageYOffset);
    window.scrollTo(0, oldScroll);
  };

  return (
    <>
      <UsersShowPageMeta user={user} />
      <Container id="e2e-usersshowpage" className={className}>
        <UserHeader userSlug={user.attributes.slug} />

        <UserNavbar
          currentTab={currentTab}
          selectTab={changeTab}
          userId={user.id}
        />

        <StyledContentContainer maxWidth={maxPageWidth}>
          {currentTab === 'ideas' && (
            <Box display="flex" w="100%" flexDirection="column">
              {ideasCount && isSmallerThanPhone && (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  mb="16px"
                >
                  {formatMessage(messages.postsWithCount, {
                    ideasCount: ideasCount.data.attributes.count,
                  })}
                </Box>
              )}
              <Box display="flex" w="100%" justifyContent="center">
                <IdeaCardsWithoutFiltersSidebar
                  defaultSortingMethod={ideaQueryParameters.sort}
                  ideaQueryParameters={ideaQueryParameters}
                  onUpdateQuery={updateSearchParams}
                  invisibleTitleMessage={messages.invisibleTitlePostsList}
                  showSearchbar
                  showDropdownFilters
                  goBackMode="goToProject"
                />
              </Box>
            </Box>
          )}

          {currentTab === 'comments' && <UserComments userId={user.id} />}
          {currentTab === 'following' && isFollowingEnabled && (
            <Following userId={user.id} />
          )}
        </StyledContentContainer>
      </Container>
    </>
  );
});

interface Props {
  className?: string;
}

const UsersShowPageOuter = ({ className }: Props) => {
  const { userSlug } = useParams() as { userSlug: string };
  const { formatMessage } = useIntl();
  const { data: user } = useUserBySlug(userSlug);
  const previousPathName = useContext(PreviousPathnameContext);
  if (!user) return null;

  if (isError(user)) {
    return (
      <NotFoundContainer className={className || ''}>
        <Helmet>
          <meta name="prerender-status-code" content="404" />
        </Helmet>
        <p>{formatMessage(messages.user404NotFound)}</p>
        <Button
          linkTo={previousPathName || '/'}
          text={formatMessage(messages.goBackToPreviousPage)}
          icon="arrow-left"
        />
      </NotFoundContainer>
    );
  }

  if (!user.data.attributes.registration_completed_at) {
    return <Unauthorized />;
  }

  return <UsersShowPage className={className} user={user.data} />;
};

export default UsersShowPageOuter;
