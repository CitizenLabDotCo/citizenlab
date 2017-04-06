/**
*
* AttachmentList
*
*/

import React, { PropTypes } from 'react';
import { Label, Row, Column } from 'components/Foundation';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import Image from './Image';
import messages from './messages';

export const Images = (props) => (<span>
  {props.images.map((image, index) =>
    (<Column large={3} key={index}>
      <Image
        source={image}
      />
    </Column>)
  )}</span>
);

const FileInput = (props) => (
  <input
    type="file"
    id="upload-image"
    onChange={props.onFileUpload}
    className={props.className}
  />
);

export const StyledFileInput = styled(FileInput)`
  opacity: 0;
  z-index: 1;
  width: 100px;
  margin-left: 10px;
  display: inline-block;
  position: absolute;
  height: 120px;
`;

class ImageList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    this.state = {
      images: [],
    };

    // set necessary bindings
    this.onFileUpload = this.onFileUpload.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      images: nextProps.images,
    });
  }

  onFileUpload(e) {
    const files = e.target.files;

    if (files.length < 1) {
      this.props.storeImage(null);
    } else {
      // convert image to data url

      const reader = new FileReader();
      reader.readAsDataURL(files[0]);

      reader.addEventListener('load', () => {
        this.props.storeImage(reader.result);

        // reset file input
        document.getElementById('upload-image').value = null;
      });
    }
  }

  render() {
    const ImagesStyled = styled(Images)`
      // no style for now
    `;

    const StyledImageButton = styled.div`
      background: no-repeat center url('https://image.flaticon.com/icons/svg/61/61112.svg');
      background-size: 100%;
      width: 100px;
      height: 100px;
      margin: 10px;
      z-index: 2;
    `;

    const { images, storeImageError } = this.props;

    return (
      <div>
        {storeImageError && <Label>
          <FormattedMessage {...messages.storeImageError} />
        </Label>}
        <Row>
          <ImagesStyled images={images} />
          <Column large={3}>
            <StyledFileInput
              onFileUpload={this.onFileUpload}
            />
            <StyledImageButton />
          </Column>
        </Row>
      </div>
    );
  }
}

ImageList.propTypes = {
  storeImage: PropTypes.func.isRequired,
  storeImageError: PropTypes.bool.isRequired,
  images: PropTypes.any.isRequired,
};

Images.propTypes = {
  images: PropTypes.any.isRequired,
};

FileInput.propTypes = {
  onFileUpload: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default ImageList;
