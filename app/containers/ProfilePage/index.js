/*
 *
 * ProfilePage
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';

import { makeSelectLoading, makeSelectError } from './selectors';
import messages from './messages';
import { storeProfile, loadProfile } from './actions';
import ProfileFormReduxState from './profile-form';

const ProfileDiv = styled.div`
  padding: 20px;
  border: 1px solid #888;
`;

export class ProfilePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    this.props.initData();
  }

  render() {
    return (
      <ProfileDiv>
        <FormattedMessage
          {...messages.header}
        />
        <ProfileFormReduxState
          onSubmitForm={this.props.onSubmitForm}
          enableReinitialize
        />
      </ProfileDiv>
    );
  }
}

ProfilePage.propTypes = {
  onSubmitForm: PropTypes.func.isRequired,
  initData: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  loading: makeSelectLoading(),
  error: makeSelectError(),
});

export function mapDispatchToProps(dispatch) {
  return {
    onSubmitForm: (values) => {
      dispatch(storeProfile(values));
    },
    initData() {
      dispatch(loadProfile());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);
