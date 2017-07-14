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
import WatchSagas from 'containers/WatchSagas';

import { bindActionCreators } from 'redux';
import { loadUserRequest } from 'resources/users/actions';
import { selectResourcesDomain } from '../../utils/resources/selectors';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { LOAD_USER_REQUEST } from 'resources/users/constants';
import sagas from 'resources/users/sagas';

// store
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import styled from 'styled-components';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import moment from 'moment';

// intl
import messages from './messages';
import { FormattedMessage } from 'react-intl';

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

export class UsersShowPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    this.props.loadUserRequest(this.props.params.slug);
  }

  render() {
    const { loadingUser, loadUserError, users, params, className, locale } = this.props;

    const user = users && users.get(params.slug);

    const attributes = user && user.get('attributes');
    const lastName = user && attributes.get('last_name');
    const firstName = user && attributes.get('first_name');
    const bio = user && attributes.get('bio_multiloc');
    const createdAt = user && attributes.get('created_at');
    const avatarURL = user && attributes.getIn(['avatar', 'medium']);

    return (
      <div className={className}>
        <WatchSagas sagas={sagas} />
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        {loadingUser && <div><FormattedMessage {...messages.loadingUser} /></div>}
        {loadUserError && <div><FormattedMessage {...messages.loadUserError} /></div>}
        {user && <div
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
            <JoinedAtStyled><FormattedMessage {...messages.joined} />&nbsp;{moment(createdAt).locale(locale).format('DD/MM/YYYY')}</JoinedAtStyled>
            <BioStyled>{bio && <T value={bio} />}</BioStyled>
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
  users: ImmutablePropTypes.map,
  loadUserRequest: PropTypes.func.isRequired,
  loadingUser: PropTypes.bool,
  loadUserError: PropTypes.bool,
  locale: PropTypes.string.isRequired,
};

const mapStateToProps = createStructuredSelector({
  users: selectResourcesDomain('users'),
  locale: makeSelectLocale(),
  loadingUser: (state) => state.getIn(['tempState', LOAD_USER_REQUEST, 'loading']),
  loadUserError: (state) => state.getIn(['tempState', LOAD_USER_REQUEST, 'error']),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ loadUserRequest }, dispatch);


export default styled(connect(mapStateToProps, mapDispatchToProps)(UsersShowPage))`
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
`;
