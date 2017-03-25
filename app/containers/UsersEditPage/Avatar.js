import React, { PropTypes } from 'react';
import Dropzone from 'react-dropzone';
import { Label, Button } from 'components/Foundation';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import messages from './messages';

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
      this.props.onAvatarUpload(reader.result);
    };

    reader.onerror = () => {
      this.props.onAvatarUpload(null);
    };
  }

  dropzoneImageStyle(avatarBase64) {
    const style = {
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('${avatarBase64}')`,
      backgroundSize: '100%',
      width: '100px',
      height: '100px',
    };

    return (
      <img
        role="presentation"
        style={style}
      />
    );
  }

  render() {
    const { avatarBase64, avatarLoadError, avatarStoreError } = this.props;

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
          { this.dropzoneImageStyle(avatarBase64) }
        </Dropzone>
        <div>
          <FormattedMessage {...messages.dragToUpload} /> or
          <span>
            <StyledFileInput />
            <StyledFileButton />
          </span>
        </div>

        {avatarLoadError && <Label>
          <FormattedMessage {...messages.avatarLoadError} />
        </Label>}
        {avatarStoreError && <Label>
          <FormattedMessage {...messages.avatarStoreError} />
        </Label>}
      </div>
    );
  }
}

Avatar.propTypes = {
  onAvatarUpload: PropTypes.func.isRequired,
  avatarBase64: PropTypes.string,
  avatarLoadError: PropTypes.bool.isRequired,
  avatarStoreError: PropTypes.bool.isRequired,
};

export default Avatar;
