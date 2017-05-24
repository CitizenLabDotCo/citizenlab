import React from 'react';
import PropTypes from 'prop-types';
import { actions, LocalForm } from 'react-redux-form';
import { FormattedMessage } from 'react-intl';
import { Grid, Label, Button } from 'semantic-ui-react';
import LocaleChanger from 'components/LocaleChanger';
import FormInput from 'components/FormInput';

import messages from './messages';
import Avatar from './Avatar';

const LabelInputPair = (props) => (
  <div
    style={{
      lineHeight: (props.hidden ? 'inherit' : '4em'),
      height: (props.hidden ? '0' : 'inherit'),
    }}
  >
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
        <Grid>
          <Grid.Row columns={2}>
            <Grid.Column width={8}>
              <LabelInputPair id="first_name" />
              <LabelInputPair id="last_name" />
              <LabelInputPair id="email" />
            </Grid.Column>
            <Grid.Column width={8}>
              {userData && userData.userId && <Avatar
                onAvatarUpload={avatarUpload}
                avatarUploadError={avatarUploadError}
                avatarURL={userData.avatar}
                userId={userData.userId}
              />}
              <LocaleChanger
                onLocaleChangeClick={onLocaleChangeClick}
                userLocale={userLocale}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Button>
          <FormattedMessage {...messages.submit} />
        </Button>
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
  userData: PropTypes.object,
  avatarUploadError: PropTypes.bool,
};
