import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import IdeaCards from 'components/IdeaCards';
import ContentContainer from 'components/ContentContainer';
import Footer from 'components/Footer';
import UsersShowPageMeta from './UsersShowPageMeta';

// resources
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import UserHeader from './UserHeader';
import UserNavbar from './UserNavbar';

const Container = styled.div`
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: ${colors.background};

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  flex: 1 1 auto;
  padding-top: 70px;
  padding-bottom: 100px;
  background: ${colors.background};

  ${media.phone`
    padding-top: 50px;
  `}
`;

const UserIdeas = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

interface InputProps {}

interface DataProps {
  user: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

export type UserTab = 'ideas' | 'comments';

interface State {
  currentTab: UserTab;
}

class UsersShowPage extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 'ideas'
    };
  }

  changeTab = (toTab: UserTab) => () => {
    this.setState({ currentTab: toTab });
  }

  render() {
    const { user } = this.props;
    const { currentTab } = this.state;

    if (!isNilOrError(user)) {
      return (
        <>
          <UsersShowPageMeta user={user} />
          <Container id="e2e-usersshowpage" className={this.props['className']}>
            <UserHeader userSlug={user.attributes.slug}/>

            <UserNavbar
              currentTab={currentTab}
              selectTab={this.changeTab}
            />

            <StyledContentContainer>
            {currentTab === 'ideas' &&
              <UserIdeas>
                <IdeaCards
                  type="load-more"
                  sort="trending"
                  pageSize={12}
                  authorId={user.id}
                />
              </UserIdeas>
            }
            {currentTab === 'comments' &&
              'hi'
            }
            </StyledContentContainer>

            <Footer showCityLogoSection={false} />
          </Container>
        </>
      );
    }

    return null;
  }
}

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetUser slug={inputProps.params.slug}>
    {user => <UsersShowPage user={user} />}
  </GetUser>
));
