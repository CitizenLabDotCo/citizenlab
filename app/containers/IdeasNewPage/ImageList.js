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

class ImageList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    this.state = {
      images: [],
    };

    // set necessary bindings
    this.onFileUpload = this.onFileUpload.bind(this);
  }

  componentDidMount() {
    this.props.loadImages();
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
      this.props.storeImage(files[0]);
    }
  }

  render() {
    const FileInput = (props) => (
      <input
        type="file"
        onChange={this.onFileUpload}
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
      height: 120px;
    `;

    const StyledImageButton = styled.div`
      background: no-repeat center url('https://image.flaticon.com/icons/svg/61/61112.svg');
      background-size: 100%;
      width: 100px;
      height: 100px;
      margin: 10px;
      z-index: 2;
    `;

    const { images, loadImagesError, storeImageError } = this.props;

    return (
      <div>
        {loadImagesError && <Label>
          <FormattedMessage {...messages.loadImagesError} />
        </Label>}
        {storeImageError && <Label>
          <FormattedMessage {...messages.storeImageError} />
        </Label>}
        <Row>
          {images.map((image, index) =>
            (<Column large={3} key={index}>
              <Image
                source={image}
              />
            </Column>)
          )}
          <Column large={3}>
            <StyledFileInput />
            <StyledImageButton />
          </Column>
        </Row>
      </div>
    );
  }
}

ImageList.propTypes = {
  loadImages: PropTypes.func.isRequired,
  storeImage: PropTypes.func.isRequired,
  images: PropTypes.any.isRequired,
  loadImagesError: PropTypes.bool.isRequired,
  storeImageError: PropTypes.bool.isRequired,
};

export default ImageList;
