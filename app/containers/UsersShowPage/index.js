/*
 *
 * UsersShowPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

// components
import HelmetIntl from 'components/HelmetIntl';
import IdeaCards from 'containers/IdeasIndexPage/pageView';
import Avatar from './Avatar';
import T from 'containers/T';

// messages
import messages from './messages';

// store
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectCurrentUserImmutable } from 'utils/auth/selectors';

import styled from 'styled-components';

const InfoContainerStyled = styled.div`
  width: 100%;
  margin: auto;
  height: 397.6px;
  border-radius: 5px;
  background-color: #ffffff;
`;

const FullNameStyled = styled.div`
  width: 100%;
  padding-top: 115px;
  font-family: Calibre;
  font-size: 29px;
  font-weight: 500;
  text-align: center;
  color: #000000;
`;

const JoinedAtStyled = styled.div`
  // TODO
`;

export class UsersShowPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { user, params, className } = this.props;

    const attributes = user.get('attributes');
    const lastName = attributes.get('last_name');
    const firstName = attributes.get('last_name');
    const bio = attributes.get('bio_multiloc');
    const avatarURL = attributes.getIn(['avatar', 'medium']);

    return (
      <div className={className}>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <div
          style={{
            margin: 'auto',
            width: '80%',
            marginTop: '159px',
          }}
        >
          {/* AVATAR */}
          <Avatar avatarURL={avatarURL} />
          <InfoContainerStyled>
            {/* USER INFORMATION */}
            <FullNameStyled>{firstName}&nbsp;{lastName}</FullNameStyled>
            <JoinedAtStyled>TODO</JoinedAtStyled>
            {bio && <T value={bio} />}
          </InfoContainerStyled>
          {/* USER IDEAS */}
          <IdeaCards
            style={{
              width: '100%',
              margin: 'auto',
            }}
            filter={{ author: params.slug }}
          />
        </div>
      </div>
    );
  }
}

UsersShowPage.propTypes = {
  className: PropTypes.string,
  params: PropTypes.object,
  user: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  user: makeSelectCurrentUserImmutable(),
});


export default styled(connect(mapStateToProps)(UsersShowPage))`
  background-color: #f2f2f2;
  margin-top: -162px;
  padding-top: 162px;
`;
