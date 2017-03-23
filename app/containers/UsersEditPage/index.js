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
  makeSelectStored,
} from './selectors';

import messages from './messages';
import { loadProfile, storeProfile } from './actions';
import ProfileForm from './ProfileForm';

const ProfileDiv = styled.div`
  padding: 20px;
  border: 1px solid #888;
`;

export class UsersEditPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    this.props.initData();
  }

  render() {
    const { loading, loadError, storeError, processing, stored, userData } = this.props;

    return (
      <ProfileDiv>
        <Helmet
          title="UsersEditPage"
          meta={[
            { name: 'description', content: 'UsersEditPage' },
          ]}
        />

        <h1><FormattedMessage {...messages.header} /></h1>

        {loading && <FormattedMessage {...messages.loading} />}
        {loadError && <FormattedMessage {...messages.loadError} />}
        {storeError && <FormattedMessage {...messages.storeError} />}
        {processing && <FormattedMessage {...messages.processing} />}
        {stored && <FormattedMessage {...messages.stored} />}

        <ProfileForm
          user={userData}
          onFormSubmit={this.props.onProfileFormSubmit}
          stored={this.props.stored || this.props.storeError}
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
  onProfileFormSubmit: React.PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  loading: makeSelectLoading(),
  loadError: makeSelectLoadError(),
  storeError: makeSelectStoreError(),
  userData: makeSelectUserData(),
  processing: makeSelectProcessing(),
  stored: makeSelectStored(),
});

export function mapDispatchToProps(dispatch) {
  return {
    initData() {
      dispatch(loadProfile());
    },
    onProfileFormSubmit: (values) => {
      dispatch(storeProfile(values));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersEditPage);
