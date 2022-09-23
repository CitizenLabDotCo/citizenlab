import { PreviousPathnameContext } from 'context';
import { isError } from 'lodash-es';
import React, { memo, useContext, useState } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';

// components
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import Button from 'components/UI/Button';
import UsersShowPageMeta from './UsersShowPageMeta';

// i18n
import { injectIntl, WrappedComponentProps } from 'react-intl';
import messages from './messages';

// hooks
import useUser from 'hooks/useUser';

// style
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import UserComments from './UserComments';
import UserHeader from './UserHeader';
import UserNavbar from './UserNavbar';

const NotFoundContainer = styled.main`
  min-height: calc(100vh - ${(props) => props.theme.menuHeight}px - 1px - 4rem);
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 4rem;
  font-size: ${fontSizes.l}px;
  color: ${colors.label};
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

  ${media.smallerThanMaxTablet`
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

interface Props {
  className?: string;
}

export type UserTab = 'ideas' | 'comments';

export const UsersShowPage = memo<
  Props & WithRouterProps & WrappedComponentProps
>(({ className, params, intl: { formatMessage } }) => {
  const [currentTab, setCurrentTab] = useState<UserTab>('ideas');
  const [savedScrollIndex, setSavedScrollIndex] = useState<number>(0);

  const previousPathName = useContext(PreviousPathnameContext);

  const user = useUser({ slug: params.userSlug });

  const changeTab = (toTab: UserTab) => () => {
    const oldScroll = savedScrollIndex;
    setCurrentTab(toTab);
    setSavedScrollIndex(window.pageYOffset);
    window.scrollTo(0, oldScroll);
  };

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
          icon="arrow-back"
        />
      </NotFoundContainer>
    );
  } else if (!isNilOrError(user)) {
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
                <IdeaCards
                  type="load-more"
                  authorId={user.id}
                  invisibleTitleMessage={messages.invisibleTitlePostsList}
                />
              </UserIdeas>
            )}

            {currentTab === 'comments' && <UserComments userId={user.id} />}
          </StyledContentContainer>
        </Container>
      </>
    );
  }
  return null;
});

export default withRouter(injectIntl(UsersShowPage));
