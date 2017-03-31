import React, { PropTypes } from 'react';
import { actions, LocalForm } from 'react-redux-form';
import { FormattedMessage } from 'react-intl';
import { Column, Row } from 'components/Foundation';

import FormInput from '../../components/FormInput/index';
import messages from './messages';
import Avatar from './Avatar';

const LabelInputPair = (props) => (
  <div>
    <label htmlFor={props.id}>
      <FormattedMessage {...messages[props.id]} />
    </label>
    <FormInput id={props.id} />
  </div>
);

LabelInputPair.propTypes = {
  id: React.PropTypes.any,
};

export default class ProfileForm extends React.PureComponent {
  componentWillReceiveProps(nextProps) {
    const user = nextProps.userData;
    if (user) {
      // load initial value (unless form being re-rendered)
      this.localFormDispatch(actions.load('user', user));
    }
  }

  render() {
    const { avatarURL, avatarUploadError, avatarUpload } = this.props;

    return (
      <LocalForm
        model="user"
        getDispatch={(dispatch) => {
          this.localFormDispatch = dispatch;
        }}
        onSubmit={this.props.onFormSubmit}
      >
        <Row>
          <Column large={6}>
            <LabelInputPair id="first_name" />
            <LabelInputPair id="last_name" />
            <LabelInputPair id="email" />
          </Column>
          <Column large={6}>
            <Avatar
              onAvatarUpload={avatarUpload}
              avatarUploadError={avatarUploadError}
              avatarURL={avatarURL}
            />
          </Column>
        </Row>
        <button type="submit">Submit</button>
      </LocalForm>
    );
  }
}

ProfileForm.propTypes = {
  onFormSubmit: PropTypes.func.isRequired,
  avatarUpload: PropTypes.func.isRequired,
  avatarURL: PropTypes.string,
  avatarUploadError: PropTypes.bool.isRequired,
};
