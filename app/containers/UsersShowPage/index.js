/*
 *
 * UsersShowPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';

// components
import T from 'containers/T';
import HelmetIntl from 'components/HelmetIntl';
import IdeaCards from 'containers/IdeasIndexPage/pageView';
import { observeUser } from 'services/users';

import Avatar from './Avatar';
import messages from './messages';

const InfoContainerStyled = styled.div`
  width: 100%;
  margin: auto;
  min-height: 397.6px;
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
    const { params, className } = this.props;

    const user = this.state.user;

    if (!user) return null;

    return (
      <div className={className}>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        {user && <div
          style={{
            margin: 'auto',
            width: '80%',
            marginTop: '159px',
          }}
        >
          {/* AVATAR */}
          <Avatar avatarURL={user.avatar.medium} />
          <InfoContainerStyled>
            {/* USER INFORMATION */}
            <FullNameStyled>{user.first_name}&nbsp;{user.last_name}</FullNameStyled>
            <JoinedAtStyled>
              <FormattedMessage {...messages.joined} values={{ date: this.props.intl.formatDate(user.created_at) }} />
            </JoinedAtStyled>
            <BioStyled>{user.bio_multiloc && <T value={user.bio_multiloc} />}</BioStyled>
          </InfoContainerStyled>
          {/* USER IDEAS */}
          <IdeaCards
            style={{
              width: '80%',
              margin: 'auto',
            }}
            filter={{ author: params.slug }}
          />
        </div>}
      </div>
    );
  }
}

UsersShowPage.propTypes = {
  className: PropTypes.string,
  params: PropTypes.object,
  intl: intlShape.isRequired,
};

export default injectIntl(styled(UsersShowPage)`
  background-color: #f2f2f2;
  margin-top: -162px;
  padding-top: 162px;

  /* override IdeaCards' unwanted styles and elements*/
  .segment {
    width: inherit !important;
  }

  .field {
    display: none;
  }
`);
