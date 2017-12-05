import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { Container, Label, Image } from 'semantic-ui-react';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

export function dropzoneImage(avatarURL) {
  return (
    avatarURL ? (<Image
      src={avatarURL}
      width="90%"
      height="90%"
      style={{ margin: '5% auto' }}
    />) : <span />
  );
}

class Avatar extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      avatar: null,
    };

    // bind props to use them within other props (onDrop)
    this.onDrop = this.onDrop.bind(this);
  }

  onDrop(result) {
    // drag and normal input
    const files = (result.target && result.target.files ? result.target.files : result);

    if (files.length < 1) {
      this.props.onAvatarUpload(null);
      return;
    }

    // convert to base64
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);

    reader.onload = () => {
      this.setState({
        avatar: reader.result,
      });
      this.props.onAvatarUpload(reader.result, this.props.userId);
    };

    reader.onerror = () => {
      this.props.onAvatarUpload(null);
    };
  }

  render() {
    const { avatarURL, avatarUploadError } = this.props;
    const { avatar } = this.state;

    return (
      <Container>
        <Dropzone
          onDrop={this.onDrop}
          accept="image/*"
          multiple={false}
        >
          { dropzoneImage(avatar || avatarURL) }
        </Dropzone>
        {avatarUploadError && <Label>
          <FormattedMessage {...messages.avatarUploadError} />
        </Label>}
      </Container>
    );
  }
}

Avatar.propTypes = {
  onAvatarUpload: PropTypes.func.isRequired,
  avatarUploadError: PropTypes.bool,
  avatarURL: PropTypes.any,
  userId: PropTypes.string,
};

export default Avatar;
