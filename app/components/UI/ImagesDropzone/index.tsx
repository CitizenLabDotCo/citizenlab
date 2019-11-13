import React, { PureComponent } from 'react';
import Dropzone from 'react-dropzone';
import { size, compact, isEmpty } from 'lodash-es';
import { reportError } from 'utils/loggingUtils';

// components
import Icon from 'components/UI/Icon';
import Error from 'components/UI/Error';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import shallowCompare from 'utils/shallowCompare';
import { getBase64FromFile, createObjectUrl, revokeObjectURL } from 'utils/fileTools';

// style
import styled, { css } from 'styled-components';
import { colors, fontSizes, customOutline } from 'utils/styleUtils';

// typings
import { UploadFile } from 'typings';

const Container = styled.div`
  width: 100%;
  display: column;
`;

const ContentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
`;

const ErrorWrapper = styled.div`
  flex: 1;
  display: flex;
`;

const DropzonePlaceholderText = styled.span`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: normal;
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

const DropzoneImagesRemaining = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: normal;
  font-weight: 400;
  text-align: center;
  margin-top: 6px;
  transition: all 100ms ease-out;
`;

const DropzoneInput = styled.input``;

const DropzoneContent = styled.div`
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
    ${DropzoneImagesRemaining} {
      color: #ccc;
    }

    ${DropzonePlaceholderIcon} {
      fill: #ccc;
    }
  ` : css`
    cursor: pointer !important;

    &:focus-within {
      outline: ${customOutline};
    }

    &:hover,
    &:focus-within {
      border-color: #000;

      ${DropzonePlaceholderText},
      ${DropzoneImagesRemaining} {
        color: #000;
      }

      ${DropzonePlaceholderIcon} {
        fill: #000;
      }
    }
  `}
`;

const DropzoneContentInner = styled.div`
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

const Image = styled.div<{ imageRadius: string | undefined, src: string, objectFit: 'cover' | 'contain' | undefined }>`
  background-repeat: no-repeat;
  background-position: center center;
  background-size: ${(props) => props.objectFit};
  background-image: url(${(props) => props.src});
  position: relative;
  box-sizing: border-box;
  border-radius: ${(props) => props.imageRadius ? props.imageRadius : props.theme.borderRadius};
  border: solid 1px #ccc;
`;

const Box = styled.div<{ maxWidth: string | undefined, ratio: number }>`
  width: 100%;
  max-width: ${({ maxWidth }) => maxWidth ? maxWidth : '100%'};
  margin-bottom: 16px;
  position: relative;

  &.hasRightMargin {
    margin-right: 20px;
  }

  ${Image},
  ${DropzoneContent} {
    width: 100%;
    height: ${({ maxWidth, ratio }) => ratio !== 1 ? 'auto' : maxWidth};
    padding-bottom: ${({ ratio }) => ratio !== 1 ? `${Math.round(ratio * 100)}%` : '0'};
  }
`;

const RemoveIcon = styled(Icon)`
  height: 10px;
  fill: #fff;
  transition: all 100ms ease-out;
`;

const RemoveButton = styled.div`
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
  images: UploadFile[] | null;
  acceptedFileTypes?: string | null | undefined;
  imagePreviewRatio: number;
  maxImagePreviewWidth?: string;
  maxImageFileSize?: number;
  maxNumberOfImages: number;
  placeholder?: string | JSX.Element | null | undefined;
  errorMessage?: string | null | undefined;
  objectFit?: 'cover' | 'contain' | undefined;
  onAdd: (arg: UploadFile) => void;
  onRemove: (arg: UploadFile) => void;
  imageRadius?: string;
  className?: string;
}

interface State {
  images: UploadFile[] | null;
  errorMessage: string | null;
}

class ImagesDropzone extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      errorMessage: null
    };
  }

  async componentDidMount() {
    const images = await this.getImageFiles(this.props.images);
    this.setState({ images });
  }

  componentWillUnmount() {
    this.revokeObjectUrls(this.state.images);
  }

  async componentDidUpdate(prevProps: Props) {
    if (!shallowCompare(prevProps, this.props)) {
      let images = this.state.images;

      if (this.props.images !== this.state.images) {
        this.revokeObjectUrls(this.state.images);
        images = await this.getImageFiles(this.props.images);
      }

      const errorMessage = (this.props.errorMessage && this.props.errorMessage !== this.state.errorMessage ? this.props.errorMessage : this.state.errorMessage);
      this.setState({ images, errorMessage });
    }
  }

  getImageFiles = async (images: UploadFile[] | null) => {
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i += 1) {
        if (!images[i].base64) {
          try {
            images[i].base64 = await getBase64FromFile(images[i]);
          } catch (error) {
            reportError(error);
          }
        }

        if (!images[i].url) {
          images[i].url = createObjectUrl(images[i]);
        }
      }
    }

    return images;
  }

  revokeObjectUrls = (images: UploadFile[] | null) => {
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i += 1) {
        if (images[i].url && images[i].url.startsWith('blob:')) {
          revokeObjectURL(images[i].url);
        }
      }
    }
  }

  onDrop = async (images: UploadFile[]) => {
    const { formatMessage } = this.props.intl;
    const maxItemsCount = this.props.maxNumberOfImages;
    const oldItemsCount = size(this.props.images);
    const newItemsCount = size(images);
    const remainingItemsCount = (maxItemsCount ? maxItemsCount - oldItemsCount : null);

    this.setState({ errorMessage: null });

    if (maxItemsCount && remainingItemsCount && newItemsCount > remainingItemsCount) {
      const errorMessage = (maxItemsCount === 1 ? formatMessage(messages.onlyOneImage) : formatMessage(messages.onlyXImages, { maxItemsCount }));
      this.setState({ errorMessage });
      setTimeout(() => this.setState({ errorMessage: null }), 6000);
    } else {
      const imagesWithPreviews = await this.getImageFiles(images);

      if (imagesWithPreviews && imagesWithPreviews.length > 0) {
        imagesWithPreviews.forEach(image => this.props.onAdd(image));
      }
    }
  }

  onDropRejected = (images: UploadFile[]) => {
    const { formatMessage } = this.props.intl;
    const maxSize = this.props.maxImageFileSize || 5000000;

    if (images.some(image => image.size > maxSize)) {
      const maxSizeExceededErrorMessage = (images.length === 1 || this.props.maxNumberOfImages === 1 ? messages.errorImageMaxSizeExceeded : messages.errorImagesMaxSizeExceeded);
      const errorMessage = formatMessage(maxSizeExceededErrorMessage, { maxFileSize: maxSize / 1000000 });
      this.setState({ errorMessage });
      setTimeout(() => this.setState({ errorMessage: null }), 6000);
    }
  }

  removeImage = (removedImage: UploadFile) => (event: React.FormEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
    setTimeout(() => this.props.onRemove(removedImage), 50);

    if (removedImage && removedImage['objectUrl']) {
      revokeObjectURL(removedImage['objectUrl']);
    }
  }

  render() {
    let { acceptedFileTypes, placeholder, objectFit } = this.props;
    let { images } = this.state;
    const { maxImageFileSize, maxNumberOfImages, maxImagePreviewWidth, imagePreviewRatio, imageRadius, className } = this.props;
    const { formatMessage } = this.props.intl;
    const { errorMessage } = this.state;
    const remainingImages = (maxNumberOfImages && maxNumberOfImages !== 1 ? `(${maxNumberOfImages - size(images)} ${formatMessage(messages.remaining)})` : null);

    images = (compact(images) || null);
    acceptedFileTypes = (acceptedFileTypes || '*');
    placeholder = (placeholder || (maxNumberOfImages && maxNumberOfImages === 1 ? formatMessage(messages.uploadImage) : formatMessage(messages.uploadMultipleImages)));
    objectFit = (objectFit || 'cover');

    return (
      <Container className={className}>
        <ContentWrapper>
          {(maxNumberOfImages > 1 || (maxNumberOfImages === 1 && isEmpty(images))) &&
            <Box
              maxWidth={maxImagePreviewWidth}
              ratio={imagePreviewRatio}
              className={images && maxNumberOfImages > 1 && images.length > 0 ? 'hasRightMargin' : ''}
            >
              <Dropzone
                accept={acceptedFileTypes}
                maxSize={maxImageFileSize}
                disabled={maxNumberOfImages === images.length}
                onDrop={this.onDrop as any}
                onDropRejected={this.onDropRejected as any}
              >
                {({ getRootProps, getInputProps }) => {
                  return (
                    <DropzoneContent {...getRootProps()}>
                      <DropzoneInput {...getInputProps()} />
                      <DropzoneContentInner>
                        <DropzonePlaceholderIcon name="upload" ariaHidden />
                        <DropzonePlaceholderText>{placeholder}</DropzonePlaceholderText>
                        <DropzoneImagesRemaining>{remainingImages}</DropzoneImagesRemaining>
                      </DropzoneContentInner>
                    </DropzoneContent>
                  );
                }}
              </Dropzone>
            </Box>
          }

          {images && images.length > 0 && images.map((image, index) => (
            <Box
              key={index}
              maxWidth={maxImagePreviewWidth}
              ratio={imagePreviewRatio}
              className={images && maxNumberOfImages > 1 && index !== images.length - 1 ? 'hasRightMargin' : ''}
            >
              <Image
                imageRadius={imageRadius}
                src={image.url}
                objectFit={objectFit}
              >
                <RemoveButton
                  onClick={this.removeImage(image)}
                  className="remove-button"
                >
                  <RemoveIcon name="close" />
                </RemoveButton>
              </Image>
            </Box>
          ))}
        </ContentWrapper>

        <ErrorWrapper>
          <Error text={errorMessage} />
        </ErrorWrapper>
      </Container>
    );
  }
}

export default injectIntl<Props>(ImagesDropzone);
