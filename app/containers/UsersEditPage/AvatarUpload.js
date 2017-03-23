import React, { PropTypes } from 'react';
import Dropzone from 'react-dropzone';

class AvatarUpload extends React.PureComponent {
  // onDrop(/*acceptedFiles, rejectedFiles*/) {
  onDrop() {
    // console.log('Accepted files: ', acceptedFiles);
    // console.log('Rejected files: ', rejectedFiles);
  }

  render() {
    return (
      <div>
        <Dropzone
          onDrop={this.onDrop}
          accept="image/*"
        >
          <div>Drop here new avatar</div>
        </Dropzone>
      </div>
    );
  }
}

AvatarUpload.propTypes = {
  onAvatarDrop: PropTypes.func.isRequired,
};
AvatarUpload.defaultProps = {};

export default AvatarUpload;

