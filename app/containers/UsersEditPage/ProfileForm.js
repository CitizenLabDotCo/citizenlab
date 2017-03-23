import React, { PropTypes } from 'react';
import { actions, LocalForm } from 'react-redux-form';
import { FormattedMessage } from 'react-intl';
import { Row, Column } from 'components/Foundation';

import Input from '../../components/Input/index';
import messages from './messages';
import AvatarUpload from './AvatarUpload';

const LabelInputPair = (props) => (
  <div>
    <label htmlFor={props.id}>
      <FormattedMessage {...messages[props.id]} />
    </label>
    <Input id={props.id} />
  </div>
);

LabelInputPair.propTypes = {
  id: React.PropTypes.any,
};

export default class ProfileForm extends React.PureComponent {
  componentWillReceiveProps(nextProps) {
    const user = nextProps.user;
    if (user) {
      // load initial value (unless form being re-rendered)
      this.localFormDispatch(actions.load('profile', user));
    }
  }

  render() {
    return (
      <LocalForm
        model="profile"
        getDispatch={(dispatch) => {
          this.localFormDispatch = dispatch;
        }}
        onSubmit={this.props.onFormSubmit}
      >
        <Row>
          <Column large={6}>
            <LabelInputPair id="firstName" />
            <LabelInputPair id="lastName" />
            <LabelInputPair id="email" />
          </Column>
          <Column large={6}>
            <AvatarUpload />
          </Column>
        </Row>
        <LabelInputPair id="gender" />
        <LabelInputPair id="age" />

        <button type="submit">Submit</button>
      </LocalForm>
    );
  }
}

ProfileForm.propTypes = {
  onFormSubmit: PropTypes.func.isRequired,
};
