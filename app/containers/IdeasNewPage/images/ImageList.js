/**
*
* AttachmentList
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Segment, Input, Label } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import Image from './Image';
import messages from '../messages';
import { selectSubmitIdea } from '../selectors';

export const Images = (props) => (<Grid columns={4}>
  <Grid.Row>
    {props.images.map((image, index) => (
      <Grid.Column
        key={index}
        width={4}
        textAlign="center"
      ><Image
        source={image}
      /></Grid.Column>
    ))}
  </Grid.Row>
</Grid>);

const FileInput = (props) => (
  <Input
    type="file"
    id="upload-image"
    onChange={props.onFileUpload}
    className={props.className}
  />
);

export const StyledFileInput = styled(FileInput)`
  width: 100%;
  border: solid 1px green;
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
      border: solid 1px red;
    `;

    const { images, storeImageError } = this.props;

    return (
      <div>
        {storeImageError && <Label>
          <FormattedMessage {...messages.storeImageError} />
        </Label>}
        <ImagesStyled images={images} />
        <div>
          <Segment>
            <StyledFileInput onFileUpload={this.onFileUpload} />
            <StyledImageButton />
          </Segment>
        </div>
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

const mapStateToProps = createStructuredSelector({
  ideasNewPageState: selectSubmitIdea,
});

const mergeProps = ({ ideasNewPageState: pageState }, dispatchProps, { storeImage }) => ({
  images: pageState.getIn(['draft', 'images']),
  storeImageError: pageState.getIn(['draft', 'storeImageError']),
  storeImage,
});

export default styled(connect(mapStateToProps, null, mergeProps)(ImageList))`
  // none yet
`;
