/*
 *
 * UsersShowPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import _ from 'lodash';

// components
import T from 'containers/T';
import HelmetIntl from 'components/HelmetIntl';
import IdeaCards from 'components/IdeaCards';
import { observeUser } from 'services/users';
import ContentContainer from 'components/ContentContainer';

import Avatar from './Avatar';
import messages from './messages';


const StyledContentContainer = styled(ContentContainer)`
  margin-top: 100px;
`;

const InfoContainerStyled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 100px;
  padding-bottom: 51.6px;
  border-radius: 5px;
  background-color: #ffffff;
`;

const FullNameStyled = styled.div`
  width: 100%;
  padding-top: 115px;
  font-size: 29px;
  font-weight: 500;
  text-align: center;
  color: #000000;
`;

const JoinedAtStyled = styled.div`
  width: 100%;
  margin-top: 10px;
  font-size: 18px;
  text-align: center;
  color: #7e7e7e;
`;

const BioStyled = styled.div`
  width: 551px;
  margin: 23px auto;
  min-height: 165px;
  font-size: 20px;
  font-weight: 300;
  line-height: 1.25;
  text-align: center;
  color: #6b6b6b;
`;

export class UsersShowPage extends React.Component { // eslint-disable-line react/prefer-stateless-function

  constructor() {
    super();
    this.userSubscription = null;
    this.state = {
      user: null,
    };
  }

  componentDidMount() {
    this.userSubscription = observeUser(this.props.params.slug)
      .observable
      .subscribe((response) => {
        this.setState({ user: response.data.attributes });
      });
  }

  componentWillUnmount() {
    this.userSubscription.unsubscribe();
  }

  render() {
    const { params } = this.props;

    const user = this.state.user;

    if (!user) return null;

    return (
      <StyledContentContainer>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        {user &&
          <div>
            <Avatar avatarURL={user.avatar.medium} />
            <InfoContainerStyled>
              <FullNameStyled>{user.first_name}&nbsp;{user.last_name}</FullNameStyled>
              <JoinedAtStyled>
                <FormattedMessage {...messages.joined} values={{ date: this.props.intl.formatDate(user.created_at) }} />
              </JoinedAtStyled>
              {!_.isEmpty(user.bio_multiloc) && <BioStyled>{user.bio_multiloc && <T value={user.bio_multiloc} />}</BioStyled>}
            </InfoContainerStyled>
            <IdeaCards
              filter={{ author: params.slug }}
              maxNumber={12}
            />
          </div>
        }
      </StyledContentContainer>
    );
  }
}

UsersShowPage.propTypes = {
  params: PropTypes.object,
  intl: intlShape.isRequired,
};

export default injectIntl(UsersShowPage);
