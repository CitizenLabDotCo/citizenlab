import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import IdeaCards from 'components/IdeaCards';
import ContentContainer from 'components/ContentContainer';
import UsersShowPageMeta from './UsersShowPageMeta';
import Button from 'components/UI/Button';

// resources
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import UserHeader from './UserHeader';
import UserNavbar from './UserNavbar';
import UserComments from './UserComments';
import { adopt } from 'react-adopt';

const NotFoundContainer = styled.div`
  height: 100%;
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  font-size: ${fontSizes.large}px;
  color: ${colors.label};
`;

const Container = styled.main`
  min-height: calc(100vh - ${(props) => props.theme.menuHeight}px - 1px);
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

interface InputProps {
  className?: string;
}

interface DataProps {
  user: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

export type UserTab = 'ideas' | 'comments';

interface State {
  currentTab: UserTab;
  savedScrollIndex: number;
}

export class UsersShowPage extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 'ideas',
      savedScrollIndex: 0,
    };
  }

  changeTab = (toTab: UserTab) => () => {
    const oldScroll = this.state.savedScrollIndex;
    this.setState({ currentTab: toTab, savedScrollIndex: window.pageYOffset });
    window.scrollTo(0, oldScroll);
  };

  render() {
    const {
      user,
      className,
      intl: { formatMessage },
    } = this.props;
    const { currentTab } = this.state;

    if (isNilOrError(user)) {
      return (
        <NotFoundContainer className={className || ''}>
          <p>{formatMessage(messages.userNotFound)}</p>
          <Button
            linkTo="/projects"
            text={formatMessage(messages.goBackToPreviousPage)}
            icon="arrow-back"
          />
        </NotFoundContainer>
      );
    }
    return (
      <>
        <UsersShowPageMeta user={user} />
        <Container id="e2e-usersshowpage" className={className}>
          <UserHeader userSlug={user.attributes.slug} />

          <UserNavbar
            currentTab={currentTab}
            selectTab={this.changeTab}
            userId={user.id}
          />

          <StyledContentContainer>
            {currentTab === 'ideas' && (
              <UserIdeas>
                <IdeaCards
                  type="load-more"
                  authorId={user.id}
                  invisibleTitleMessage={messages.invisibleTitleIdeasList}
                />
              </UserIdeas>
            )}

            {currentTab === 'comments' && <UserComments userId={user.id} />}
          </StyledContentContainer>
        </Container>
      </>
    );
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  user: ({ params, render }) => <GetUser slug={params.slug}>{render}</GetUser>,
});

export default withRouter(
  injectIntl((inputProps: InputProps & WithRouterProps) => (
    <Data {...inputProps}>
      {(dataProps) => <UsersShowPage {...inputProps} {...dataProps} />}
    </Data>
  ))
);
