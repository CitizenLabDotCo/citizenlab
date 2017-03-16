/*
 *
 * ProfilePage
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
import { loadProfile } from './actions';
import ProfileForm from './profile-form';

const ProfileDiv = styled.div`
  padding: 20px;
  border: 1px solid #888;
`;

export class ProfilePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    this.props.initData();
  }

  render() {
    const { loading, loadError, storeError, processing, stored, userData } = this.props;

    return (
      <ProfileDiv>
        <Helmet
          title="ProfilePage"
          meta={[
            { name: 'description', content: 'ProfilePage' },
          ]}
        />

        <h1><FormattedMessage {...messages.header} /></h1>

        {loading && <FormattedMessage {...messages.loading} />}
        {loadError && <FormattedMessage {...messages.loadError} />}
        {storeError && <FormattedMessage {...messages.storeError} />}
        {processing && <FormattedMessage {...messages.processing} />}
        {stored && <FormattedMessage {...messages.stored} />}

        <ProfileForm {...userData} />
      </ProfileDiv>
    );
  }
}

ProfilePage.propTypes = {
  initData: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  loadError: PropTypes.bool.isRequired,
  storeError: PropTypes.bool.isRequired,
  userData: PropTypes.object,
  processing: PropTypes.bool.isRequired,
  stored: PropTypes.bool.isRequired,
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
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);
