import React, { useState, useContext, memo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { PreviousPathnameContext } from 'context';

// router
import { useParams } from 'react-router-dom';

// components
import { IdeaCardsWithoutFiltersSidebar } from 'components/IdeaCards';
import ContentContainer from 'components/ContentContainer';
import UsersShowPageMeta from './UsersShowPageMeta';
import Button from 'components/UI/Button';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useUserBySlug from 'api/users/useUserById';

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
import { IUserData } from 'services/users';
import { IQueryParameters } from 'api/ideas/types';

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

const UserIdeas = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

export type UserTab = 'ideas' | 'comments';

interface InnerProps {
  className?: string;
  user: IUserData;
}

export const UsersShowPage = memo<InnerProps>(({ className, user }) => {
  const [currentTab, setCurrentTab] = useState<UserTab>('ideas');
  const [savedScrollIndex, setSavedScrollIndex] = useState<number>(0);

  const [ideaQueryParameters, setIdeaQueryParameters] =
    useState<IQueryParameters>({
      author: user.id,
      sort: ideaDefaultSortMethodFallback,
      'page[number]': 1,
      'page[size]': 24,
    });

  const updateQuery = useCallback((newParams: Partial<IQueryParameters>) => {
    setIdeaQueryParameters((current) => ({ ...current, ...newParams }));
  }, []);

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
            <UserIdeas>
              <IdeaCardsWithoutFiltersSidebar
                ideaQueryParameters={ideaQueryParameters}
                onUpdateQuery={updateQuery}
                invisibleTitleMessage={messages.invisibleTitlePostsList}
              />
            </UserIdeas>
          )}

          {currentTab === 'comments' && <UserComments userId={user.id} />}
        </StyledContentContainer>
      </Container>
    </>
  );
});

interface Props {
  className?: string;
}

const UsersShowPageOuter = ({ className }: Props) => {
  const params = useParams();
  const { formatMessage } = useIntl();
  const { data: user } = useUserBySlug(params.slug);
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
