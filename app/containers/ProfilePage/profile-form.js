import React, { PropTypes } from 'react';
import { LocalForm } from 'react-redux-form';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';

import { makeSelectUserData } from './selectors';
import { storeProfile } from './actions';
import Label from '../../components/Label/index';
import Input from '../../components/Input/index';
import messages from './messages';

class ProfileForm extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      profile: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      profile: nextProps.user,
    });
  }

  render() { // SPLIT IN 2 l & define a component which uses both (themselves are styled)
    const ProfileLabel = styled(Label)`
          // TODO: styles here
    `;

    const ProfileInput = styled(Input)`
          // TODO: styles here
    `;

    const LabelInputPair = (props) => (
      <div>
        <ProfileLabel
          id={props.id}
          label={this.context.intl.formatMessage(messages[props.id])}
        />
        <ProfileInput id={props.id} />
      </div>
    );

    return (
      <LocalForm
        model="profile"
        initialState={this.props.user}
        onSubmit={(values) => this.props.onFormSubmit(values)}
      >
        <LabelInputPair id="firstName" />
        <LabelInputPair id="lastName" />
        <LabelInputPair id="email" />
        <LabelInputPair id="gender" />
        <LabelInputPair id="age" />

        <button type="submit">Submit</button>
      </LocalForm>
    );
  }
}

ProfileForm.contextTypes = {
  intl: PropTypes.object.isRequired,
};

ProfileForm.propTypes = {
  user: PropTypes.object,
  onFormSubmit: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  userData: makeSelectUserData(),
});

export function mapDispatchToProps(dispatch) {
  return {
    onFormSubmit: (values) => {
      dispatch(storeProfile(values));
    },

  };
}

// connect reducers for model updating based on state
export default connect(mapStateToProps, mapDispatchToProps)(ProfileForm);
