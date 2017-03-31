import React, { PropTypes } from 'react';
import { actions, LocalForm } from 'react-redux-form';
import { FormattedMessage } from 'react-intl';
import { Column, Row, Label } from 'components/Foundation';

import FormInput from '../../components/FormInput/index';
import messages from './messages';
import Avatar from './Avatar';

const LabelInputPair = (props) => (
  <div>
    {!props.hidden && <label htmlFor={props.id}>
       <FormattedMessage {...messages[props.id]} />
    </label>}
    <FormInput id={props.id} hidden={props.hidden} />
  </div>
);

LabelInputPair.propTypes = {
  id: PropTypes.string.isRequired,
  hidden: PropTypes.bool,
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
    const { avatarUploadError, avatarUpload, userData } = this.props;

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
              avatarURL={userData.avatar}
            />
          </Column>
        </Row>
        <button type="submit">Submit</button>
        <LabelInputPair id="avatar" hidden={true} />
        <LabelInputPair id="userId" hidden={true} />
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
