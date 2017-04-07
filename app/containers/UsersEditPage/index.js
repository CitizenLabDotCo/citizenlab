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
  makeSelectAvatarUploadError, makeSelectLoadError, makeSelectLoading, makeSelectProcessing,
  makeSelectStored, makeSelectStoreError, makeSelectUserData,
} from './selectors';

import messages from './messages';
import { avatarStoreError, storeAvatar, updateCurrentUser } from './actions';
import ProfileForm from './ProfileForm';
import { loadCurrentUser } from '../App/actions';
import { changeLocale } from '../LanguageProvider/actions';
import { makeSelectLocale } from '../LanguageProvider/selectors';

const ProfileDiv = styled.div`
  padding: 20px;
  border: 1px solid #888;
`;

export class UsersEditPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    // fetch existing profile / avatar
    this.props.initData();
  }

  render() {
    const { loading, loadError, storeError, processing, stored, userData, onAvatarUpload, avatarUploadError, onProfileFormSubmit, onLocaleChangeClick, currentLocale } = this.props;

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
          currentLocale={currentLocale}
          onLocaleChangeClick={onLocaleChangeClick}
          userData={userData}
          avatarUpload={onAvatarUpload}
          onFormSubmit={onProfileFormSubmit}
          avatarUploadError={avatarUploadError}
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
  avatarUploadError: PropTypes.bool.isRequired,
  onLocaleChangeClick: PropTypes.func.isRequired,
  currentLocale: PropTypes.string.isRequired,
};

const mapStateToProps = createStructuredSelector({
  loading: makeSelectLoading(),
  loadError: makeSelectLoadError(),
  storeError: makeSelectStoreError(),
  userData: makeSelectUserData(),
  processing: makeSelectProcessing(),
  stored: makeSelectStored(),
  avatarUploadError: makeSelectAvatarUploadError(),
  currentLocale: makeSelectLocale(),
});

export function mapDispatchToProps(dispatch) {
  return {
    initData: () => {
      dispatch(loadCurrentUser());
    },
    onProfileFormSubmit: (values) => {
      dispatch(updateCurrentUser(values));
    },
    onAvatarUpload: (imageBase64) => {
      if (imageBase64) {
        dispatch(storeAvatar(imageBase64));
      } else {
        dispatch(avatarStoreError());
      }
    },
    onLocaleChangeClick: (locale) => {
      dispatch(changeLocale(locale));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersEditPage);
