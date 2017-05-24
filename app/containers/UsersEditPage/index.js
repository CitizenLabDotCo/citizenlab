/*
 *
 * UsersEditPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';
import FormattedMessageSegment from 'components/FormattedMessageSegment';
import WatchSagas from 'containers/WatchSagas/';
import { preprocess } from 'utils/reactRedux';
import { bindActionCreators } from 'redux';

import {
  selectProfile,
} from './selectors';

import messages from './messages';
import { storeAvatar, storeAvatarError, updateCurrentUser, updateLocale } from './actions';
import ProfileForm from './ProfileForm';
import { loadCurrentUser } from '../App/actions';
import sagas from './sagas';
import { LOAD_CURRENT_USER_REQUEST } from 'utils/auth/constants';
import { UPDATE_CURRENT_USER_REQUEST, STORE_AVATAR_REQUEST } from 'containers/UsersEditPage/constants';


const ProfileDiv = styled.div`
  padding: 20px;
  border: 1px solid #888;
`;

export class UsersEditPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    // fetch existing profile / avatar
    this.props.loadCurrentUser();
  }

  render() {
    const { loading, loadError, storeError, processing, stored, currentUser, onAvatarUpload, avatarUploadError } = this.props;

    return (
      <ProfileDiv>
        <Helmet
          title="UsersEditPage"
          meta={[
            { name: 'description', content: 'UsersEditPage' },
          ]}
        />
        <WatchSagas sagas={sagas} />

        {loading && <FormattedMessageSegment message={messages.loading} />}
        {loadError && <FormattedMessageSegment message={messages.loadError} />}
        {storeError && <FormattedMessageSegment message={messages.storeError} />}
        {processing && <FormattedMessageSegment message={messages.processing} />}
        {stored && <FormattedMessageSegment message={messages.stored} />}

        <ProfileForm
          onLocaleChangeClick={this.props.updateLocale}
          userData={currentUser}
          avatarUpload={onAvatarUpload}
          onFormSubmit={this.props.updateCurrentUser}
          avatarUploadError={avatarUploadError}
        />
      </ProfileDiv>
    );
  }
}

UsersEditPage.propTypes = {
  loadError: PropTypes.bool,
  loading: PropTypes.bool,
  storeError: PropTypes.bool,
  currentUser: PropTypes.object,
  processing: PropTypes.bool,
  stored: PropTypes.bool.isRequired,
  loadCurrentUser: PropTypes.func.isRequired,
  updateCurrentUser: PropTypes.func.isRequired,
  onAvatarUpload: PropTypes.func.isRequired,
  avatarUploadError: PropTypes.bool,
  updateLocale: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  pageState: selectProfile,
  // here, rather than mergeProps, for correct re-render trigger
  loading: (state) => state.getIn(['tempState', LOAD_CURRENT_USER_REQUEST, 'loading']),
  storeError: (state) => state.getIn(['tempState', UPDATE_CURRENT_USER_REQUEST, 'error']),
  loadError: (state) => state.getIn(['tempState', LOAD_CURRENT_USER_REQUEST, 'error']),
  processing: (state) => state.getIn(['tempState', UPDATE_CURRENT_USER_REQUEST, 'loading']),
  avatarUploadError: (state) => state.getIn(['tempState', STORE_AVATAR_REQUEST, 'error']),
});

const customActionCreators = {
  onAvatarUpload(imageBase64, userId) {
    if (imageBase64 && userId) {
      return storeAvatar(imageBase64, userId);
    }
    return storeAvatarError();
  },
};

export const mapDispatchToProps = (dispatch) => bindActionCreators({
  loadCurrentUser,
  updateCurrentUser,
  updateLocale,
  ...customActionCreators,
}, dispatch);

const mergeProps = (stateProps, dispatchProps) => ({
  currentUser: stateProps.pageState.get('currentUser').toJS(),
  stored: stateProps.pageState.get('stored'),
  ...stateProps,
  ...dispatchProps,
});

export default preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(UsersEditPage);
