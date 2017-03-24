/*
 *
 * UsersEditPage
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';

import {
  makeSelectLoading,
  makeSelectUserData,
  makeSelectLoadError,
  makeSelectStoreError,
  makeSelectProcessing,
  makeSelectStored, makeSelectAvatarStoreError, makeSelectAvatarLoadError,
  makeSelectAvatarBase64,
} from './selectors';

import messages from './messages';
import { loadAvatar, loadProfile, storeAvatar, storeAvatarError, storeProfile } from './actions';
import ProfileForm from './ProfileForm';

const ProfileDiv = styled.div`
  padding: 20px;
  border: 1px solid #888;
`;

export class UsersEditPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    // fetch existing profile / avatar
    this.props.initData();
    this.props.avatarFetch();
  }

  render() {
    const { loading, loadError, storeError, processing, stored, userData, onAvatarUpload, onProfileFormSubmit, avatarBase64, avatarStoreError, avatarLoadError } = this.props;

    return (
      <ProfileDiv>
        <Helmet
          title="UsersEditPage"
          meta={[
            { name: 'description', content: 'UsersEditPage' },
          ]}
        />

        {loading && <FormattedMessage {...messages.loading} />}
        {loadError && <FormattedMessage {...messages.loadError} />}
        {storeError && <FormattedMessage {...messages.storeError} />}
        {processing && <FormattedMessage {...messages.processing} />}
        {stored && <FormattedMessage {...messages.stored} />}

        <ProfileForm
          user={userData}
          avatarUpload={onAvatarUpload}
          onFormSubmit={onProfileFormSubmit}
          avatarStoreError={avatarStoreError}
          avatarLoadError={avatarLoadError}
          avatarBase64={avatarBase64}
        />
      </ProfileDiv>
    );
  }
}

UsersEditPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  loadError: PropTypes.bool.isRequired,
  storeError: PropTypes.bool.isRequired,
  userData: PropTypes.object,
  processing: PropTypes.bool.isRequired,
  stored: PropTypes.bool.isRequired,
  initData: PropTypes.func.isRequired,
  onProfileFormSubmit: PropTypes.func.isRequired,
  onAvatarUpload: PropTypes.func.isRequired,
  avatarFetch: PropTypes.func.isRequired,
  avatarBase64: PropTypes.string,
  avatarStoreError: PropTypes.bool.isRequired,
  avatarLoadError: PropTypes.bool.isRequired,
};

const mapStateToProps = createStructuredSelector({
  loading: makeSelectLoading(),
  loadError: makeSelectLoadError(),
  storeError: makeSelectStoreError(),
  userData: makeSelectUserData(),
  processing: makeSelectProcessing(),
  stored: makeSelectStored(),
  avatarStoreError: makeSelectAvatarStoreError(),
  avatarLoadError: makeSelectAvatarLoadError(),
  avatarBase64: makeSelectAvatarBase64(),
});

export function mapDispatchToProps(dispatch) {
  return {
    initData: () => {
      dispatch(loadProfile());
    },
    onProfileFormSubmit: (values) => {
      dispatch(storeProfile(values));
    },
    onAvatarUpload: (filesBase64) => {
      if (filesBase64) {
        dispatch(storeAvatar(filesBase64));
      } else {
        dispatch(storeAvatarError());
      }
    },
    avatarFetch: () => {
      dispatch(loadAvatar());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersEditPage);
