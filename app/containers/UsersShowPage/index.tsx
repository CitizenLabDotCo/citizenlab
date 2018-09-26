import React, { PureComponent } from 'react';
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import moment from 'moment';

// components
import IdeaCards from 'components/IdeaCards';
import ContentContainer from 'components/ContentContainer';
import Avatar from 'components/Avatar';
import Footer from 'components/Footer';

// resources
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, colors, fontSizes, quillEditedContent } from 'utils/styleUtils';

const Container = styled.div`
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: #f9f9fa;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  flex: 1 1 auto;
  padding-top: 40px;
  padding-bottom: 100px;
  background: ${colors.background};

  ${media.phone`
    padding-top: 0px;
  `}
`;

const UserAvatar = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 40px;
  margin-bottom: 40px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 0px;
  padding-bottom: 40px;
  border-radius: 5px;
`;

const FullName = styled.div`
  width: 100%;
  padding-top: 0px;
  font-size: ${fontSizes.xxxl}px;
  font-weight: 500;
  text-align: center;
  color: #333;
`;

const JoinedAt = styled.div`
  width: 100%;
  margin-top: 15px;
  font-size: ${fontSizes.large}px;
  font-weight: 400;
  text-align: center;
  color: ${colors.clGreyOnGreyBackground};
`;

const Bio = styled.div`
  font-size: ${fontSizes.xl}px;
  line-height: 1.25;
  color: #6b6b6b;
  max-width: 600px;
  text-align: center;
  font-weight: 300;
  margin: 23px auto;
  ${quillEditedContent()}
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

interface State {}

class UsersShowPage extends PureComponent<Props, State> {
  render() {
    const { user } = this.props;

    if (!isNilOrError(user)) {
      const memberSince = moment(user.attributes.created_at).format('LL');

      return (
        <Container className={this.props['className']}>
          <StyledContentContainer>
            <UserAvatar>
              <Avatar userId={user.id} size="180px" />
            </UserAvatar>

            <UserInfo>
              <FullName>{user.attributes.first_name} {user.attributes.last_name}</FullName>
              <JoinedAt>
                <FormattedMessage {...messages.memberSince} values={{ date: memberSince }} />
              </JoinedAt>
              {!isEmpty(user.attributes.bio_multiloc) &&
                <Bio>
                  {user.attributes.bio_multiloc && <T value={user.attributes.bio_multiloc} supportHtml={true} />}
                </Bio>
              }
            </UserInfo>

            <UserIdeas>
              <IdeaCards
                type="load-more"
                sort="trending"
                pageSize={12}
                authorId={user.id}
              />
            </UserIdeas>
          </StyledContentContainer>

          <Footer showCityLogoSection={false} />
        </Container>
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
