import React from 'react';
import PropTypes from 'prop-types';
import TextInput from 'components/forms/inputs/text';
import Button from 'components/buttons/loader';
import { Form, Grid } from 'semantic-ui-react';
import LocaleChanger from 'components/LocaleChanger';

import messages from './messages';
import Avatar from './Avatar';
import generateErrorsObject from 'components/forms/generateErrorsObject';
import _ from 'lodash';

export default class ProfileForm extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      user: null,
      avatar: '',
    };

    // provide context to bindings
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleAvatarUpload = this.handleAvatarUpload.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const user = nextProps.userData;

    if (!this.state.user || _.isEmpty(this.state.user)) {
      this.setState({
        user,
      });
    }

    this.setState({
      avatar: user && user.avatar,
    });
  }

  handleAvatarUpload = (avatarBase64, userId) => {
    this.props.avatarUpload(avatarBase64, userId);
  };

  handleChange = (name, value) => {
    const { user } = this.state;
    user[name] = value;
    this.setState({
      user,
    });
  };

  handleSubmit(e) {
    e.preventDefault();
    const { user } = this.state;

    this.props.onFormSubmit(user);
  }

  render() {
    const { avatarUploadError, userData: user, onLocaleChangeClick, processing, storeErrors } = this.props;
    const userLocale = (user
      ? user.locale
      : 'en');

    const userErrors = storeErrors && generateErrorsObject(storeErrors);

    return (
      <Form onSubmit={this.handleSubmit}>
        <Grid>
          <Grid.Row columns={2}>
            <Grid.Column width={8}>
              <TextInput name={'first_name'} action={this.handleChange} initialValue={user && user.first_name} errors={userErrors && userErrors.first_name} />
              <TextInput name={'last_name'} action={this.handleChange} initialValue={user && user.last_name} errors={userErrors && userErrors.last_name} />
              <TextInput name={'email'} action={this.handleChange} initialValue={user && user.email} errors={userErrors && userErrors.email} />
            </Grid.Column>
            <Grid.Column width={8}>
              {user && user.userId && <Avatar
                onAvatarUpload={this.handleAvatarUpload}
                avatarUploadError={avatarUploadError}
                avatarURL={user.avatar}
                userId={user.userId}
              />}
              <LocaleChanger
                onLocaleChangeClick={onLocaleChangeClick}
                userLocale={userLocale}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Button message={messages.submit} loading={processing} />
      </Form>
    );
  }
}

ProfileForm.propTypes = {
  onFormSubmit: PropTypes.func.isRequired,
  avatarUpload: PropTypes.func.isRequired,
  onLocaleChangeClick: PropTypes.func.isRequired,
  userData: PropTypes.object,
  avatarUploadError: PropTypes.bool,
  processing: PropTypes.bool,
  storeErrors: PropTypes.object,
};
