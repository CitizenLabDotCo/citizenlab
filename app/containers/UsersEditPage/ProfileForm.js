import React from 'react';
import PropTypes from 'prop-types';
import { actions, LocalForm } from 'react-redux-form';
import { FormattedMessage } from 'react-intl';
import { Column, Row, Label } from 'components/Foundation';
import LocaleChanger from 'components/LocaleChanger';

import FormInput from '../../components/FormInput/index';
import messages from './messages';
import Avatar from './Avatar';

const LabelInputPair = (props) => (
  <div>
    {!props.hidden && <Label htmlFor={props.id}>
      <FormattedMessage {...messages[props.id]} />
    </Label>}
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
    const { avatarUploadError, avatarUpload, userData, onLocaleChangeClick } = this.props;
    const userLocale = (userData
      ? userData.locale
      : 'en');

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
            {userData.userId && <Avatar
              onAvatarUpload={avatarUpload}
              avatarUploadError={avatarUploadError}
              avatarURL={userData.avatar}
              userId={userData.userId}
            />}
            <LocaleChanger
              onLocaleChangeClick={onLocaleChangeClick}
              userLocale={userLocale}
            />
          </Column>
        </Row>
        <button type="submit">Submit</button>
        <LabelInputPair id="avatar" hidden />
        <LabelInputPair id="locale" hidden />
        <LabelInputPair id="userId" hidden />
      </LocalForm>
    );
  }
}

ProfileForm.propTypes = {
  onFormSubmit: PropTypes.func.isRequired,
  avatarUpload: PropTypes.func.isRequired,
  onLocaleChangeClick: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired,
  avatarUploadError: PropTypes.bool.isRequired,
};
