import React, { PureComponent } from 'react';
import Dropzone from 'react-dropzone';
import { size } from 'lodash-es';

// components
import Icon from 'components/UI/Icon';
import Spinner from 'components/UI/Spinner';
import Error from 'components/UI/Error';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import shallowCompare from 'utils/shallowCompare';
import { getBase64FromFile, createObjectUrl, revokeObjectURL } from 'utils/imageTools';

// style
import styled, { css } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { UploadFile } from 'typings';

const Container = styled.div`
  width: 100%;
  display: column;
  margin-bottom: 10px;
`;

const ContentWrapper: any = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
`;

const ErrorWrapper = styled.div`
  flex: 1;
  margin-top: -12px;
`;

const DropzonePlaceholderText = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: 20px;
  font-weight: 400;
  text-align: center;
  width: 100%;
  transition: all 100ms ease-out;
`;

const DropzonePlaceholderIcon = styled(Icon)`
  height: 32px;
  fill: ${colors.label};
  margin-bottom: 5px;
  transition: all 100ms ease-out;
`;

const DropzoneImageRemaining = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: 18px;
  font-weight: 400;
  text-align: center;
  margin-top: 6px;
  transition: all 100ms ease-out;
`;

const DropzoneContent = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const StyledDropzone = styled(Dropzone)`
  box-sizing: border-box;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: 1px dashed ${colors.label};
  position: relative;
  cursor: pointer;
  background: transparent;
  transition: all 100ms ease-out;

  &.rounded {
    border-radius: 50%;
  }

  ${(props: any) => props.disabled ? css`
    cursor: not-allowed;
    border-color: #ccc;
    cursor: no-drop !important;

    ${DropzonePlaceholderText},
    ${DropzoneImageRemaining} {
      color: #ccc;
    }

    ${DropzonePlaceholderIcon} {
      fill: #ccc;
    }
  ` : css`
    cursor: pointer !important;

    &:hover {
      border-color: #000;

      ${DropzonePlaceholderText},
      ${DropzoneImageRemaining} {
        color: #000;
      }

      ${DropzonePlaceholderIcon} {
        fill: #000;
      }
    }
  `}
`;

const Image: any = styled.div`
  background-repeat: no-repeat;
  background-position: center center;
  background-size: ${(props: any) => props.objectFit};
  background-image: url(${(props: any) => props.src});
  position: relative;
  box-sizing: border-box;
  border-radius: ${(props: any) => props.imageRadius ? props.imageRadius : props.theme.borderRadius};
  border: solid 1px #ccc;
`;

const Box: any = styled.div`
  width: 100%;
  max-width: ${(props: any) => props.maxWidth ? props.maxWidth : '100%'};
  margin-bottom: 16px;
  position: relative;

  &.hasSpacing {
    margin-right: 20px;
  }

  ${Image},
  ${StyledDropzone} {
    width: 100%;
    height: 100%;
    height: ${(props: any) => props.ratio !== 1 ? 'auto' : props.maxWidth};
    padding-bottom: ${(props: any) => props.ratio !== 1 ? `${Math.round(props.ratio * 100)}%` : '0'};
  }
`;

const RemoveIcon = styled(Icon)`
  height: 10px;
  fill: #fff;
  transition: all 100ms ease-out;
`;

const RemoveButton: any = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 0;
  cursor: pointer;
  border-radius: 50%;
  border: solid 1px transparent;
  background: rgba(0, 0, 0, 0.6);
  transition: all 100ms ease-out;

  &:hover {
    background: #000;
    border-color: #fff;

    ${RemoveIcon} {
      fill: #fff;
    }
  }
`;

interface Props {
  id?: string | undefined;
  image: UploadFile | null;
  acceptedFileTypes?: string | null | undefined;
  imagePreviewRatio?: number;
  maxImagePreviewWidth?: string;
  maxImageFileSize?: number;
  errorMessage?: string | null | undefined;
  objectFit?: 'cover' | 'contain' | undefined;
  onChange: (arg: UploadFile | null) => void;
  imageRadius?: string;
}

interface State {
  image: UploadFile | null;
  errorMessage: string | null;
  processing: boolean;
  canAnimate: boolean;
  canAnimateTimeout: any;
}

class ImageDropzone extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
      errorMessage: null,
      processing: false,
      canAnimate: false,
      canAnimateTimeout: null
    };
  }

  async componentDidMount() {
    const image = await this.getImageFiles(this.props.image);
    this.setState({ image });
  }

  componentWillUnmount() {
    this.revokeObjectUrls(this.state.image);
  }

  async componentDidUpdate(prevProps: Props) {
    if (!shallowCompare(prevProps, this.props)) {
      let image = this.state.image;

      if (this.props.image !== this.state.image) {
        this.revokeObjectUrls(this.state.image);
        image = await this.getImageFiles(this.props.image);
      }

      const errorMessage = (this.props.errorMessage && this.props.errorMessage !== this.state.errorMessage ? this.props.errorMessage : this.state.errorMessage);
      const processing = (this.state.canAnimate && !errorMessage && size(image) > size(this.state.image));

      // if (processing) {
      //   setTimeout(() => this.setState({ processing: false }), 1800);
      // }

      this.setState({
        image,
        errorMessage,
        processing
      });
    }
  }

  getImageFiles = async (image: UploadFile | null) => {
    if (image) {
        if (!image.base64) {
          try {
            image.base64 = await getBase64FromFile(image);
          } catch (error) {
            console.log(error);
          }
        }

        if (!image.url) {
          image.url = createObjectUrl(image);
        }
      }

    return image;
  }

  revokeObjectUrls = (image: UploadFile | null) => {
    if (image) {
      if (image.url && image.url.startsWith('blob:')) {
        revokeObjectURL(image.url);
      }
    }
  }

  onDropRejected = (images: UploadFile[]) => {
    const { formatMessage } = this.props.intl;
    const maxSize = this.props.maxImageFileSize || 5000000;

    if (images[0].size > maxSize) {
      const errorMessage = formatMessage(messages.errorImageMaxSizeExceeded, { maxFileSize: maxSize / 1000000 });
      this.setState({ errorMessage });
      setTimeout(() => this.setState({ errorMessage: null }), 6000);
    }
  }

  onDropAccepted = async (images: UploadFile[]) => {
    const imageWithPreviews = await this.getImageFiles(images[0]);

    if (imageWithPreviews) {
      this.props.onChange(imageWithPreviews);
    }
  }

  removeImage = (removedImage: UploadFile) => (event: React.FormEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();

    this.props.onChange(null);

    if (removedImage && removedImage['objectUrl']) {
      revokeObjectURL(removedImage['objectUrl']);
    }
  }

  render() {
    let { acceptedFileTypes, objectFit } = this.props;
    const className = this.props['className'];
    const { maxImageFileSize,
            maxImagePreviewWidth,
            imagePreviewRatio,
            imageRadius } = this.props;
    const { formatMessage } = this.props.intl;
    const { errorMessage, processing, image } = this.state;

    acceptedFileTypes = (acceptedFileTypes || '*');
    objectFit = (objectFit || 'cover');

    return (
      <Container className={className}>
        <ContentWrapper>
          {image && image.url ? (
            <Box
              maxWidth={maxImagePreviewWidth}
              ratio={imagePreviewRatio}
            >
              <Image imageRadius={imageRadius} src={image.url} objectFit={objectFit}>
                <RemoveButton onClick={this.removeImage(image)} className="remove-button">
                  <RemoveIcon name="close" />
                </RemoveButton>
              </Image>
            </Box>
          ) : (
              <Box
                maxWidth={maxImagePreviewWidth}
                ratio={imagePreviewRatio}
              >
                <StyledDropzone
                  className={`${this.props.imageRadius === '50%' && 'rounded'}`}
                  accept={acceptedFileTypes}
                  maxSize={maxImageFileSize}
                  disabled={processing}
                  disablePreview={true}
                  onDropRejected={this.onDropRejected}
                  onDropAccepted={this.onDropAccepted}
                >
                  {!processing ? (
                    <DropzoneContent>
                      <DropzonePlaceholderIcon name="upload" />
                      <DropzonePlaceholderText>{formatMessage(messages.dropYourImageHere)}</DropzonePlaceholderText>
                    </DropzoneContent>
                  ) : (
                    <DropzoneContent>
                      <Spinner />
                    </DropzoneContent>
                  )}
                </StyledDropzone>
              </Box>
          )}
        </ContentWrapper>

        <ErrorWrapper>
          <Error text={errorMessage} />
        </ErrorWrapper>
      </Container>
    );
  }
}

export default injectIntl<Props>(ImageDropzone);
