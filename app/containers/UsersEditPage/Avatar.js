import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { Button, Label } from 'components/Foundation';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import messages from './messages';

export function dropzoneImage(avatarURL) {
  const style = {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundImage: `url('${avatarURL}')`,
    backgroundSize: '100%',
    margin: '5% auto',
    width: '90%',
    height: '90%',
  };

  return (
    avatarURL
      ? (<div style={style}></div>)
      : <span />
  );
}

class Avatar extends React.PureComponent {
  constructor() {
    super();

    // bind props to use them within other drops (onDrop)
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
      this.props.onAvatarUpload(reader.result, this.props.userId);
    };

    reader.onerror = () => {
      this.props.onAvatarUpload(null);
    };
  }

  render() {
    const { avatarURL, avatarUploadError } = this.props;

    const FileInput = (props) => (
      <input
        type="file"
        onChange={this.onDrop}
        accept="image/*"
        className={props.className}
      />
    );
    const StyledFileInput = styled(FileInput)`
      opacity: 0;
      z-index: 1;
      width: 100px;
      margin-left: 10px;
      display: inline-block;
      position: absolute;
      height: 40px;
    `;
    const FileButton = (props) => (
      <Button className={props.className}>
        <FormattedMessage {...messages.clickToUpload} />
      </Button>
    );
    const StyledFileButton = styled(FileButton)`
      width: 100px;
      margin-left: 10px;
      z-index: 2;
    `;

    return (
      <div>
        <Dropzone
          onDrop={this.onDrop}
          accept="image/*"
          multiple={false}
        >
          { dropzoneImage(avatarURL) }
        </Dropzone>
        <div>
          <FormattedMessage {...messages.dragToUpload} /> or
          <span>
            <StyledFileInput />
            <StyledFileButton />
          </span>
        </div>

        {avatarUploadError && <Label>
          <FormattedMessage {...messages.avatarUploadError} />
        </Label>}
      </div>
    );
  }
}

Avatar.propTypes = {
  onAvatarUpload: PropTypes.func.isRequired,
  avatarURL: PropTypes.any,
  avatarUploadError: PropTypes.bool.isRequired,
  userId: PropTypes.string,
};

export default Avatar;
