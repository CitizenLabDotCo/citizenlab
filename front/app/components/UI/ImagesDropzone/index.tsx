import React, { PureComponent } from 'react';

import {
  Icon,
  colors,
  fontSizes,
  defaultOutline,
} from '@citizenlab/cl2-component-library';
import { size, isEmpty, uniqBy, forEach } from 'lodash-es';
import Dropzone, { Accept } from 'react-dropzone';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';
import { UploadFile } from 'typings';

import Error from 'components/UI/Error';

import { injectIntl } from 'utils/cl-intl';
import { base64ToBlob, getBase64FromFile } from 'utils/fileUtils';
import { reportError } from 'utils/loggingUtils';

import RemoveImageButton from '../RemoveImageButton';

import messages from './messages';

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

/*
  Changing this to a label causes unexpected behavior when selecting files,
  which isn't easy to solve. Sometimes my system's file picker would reopen
  after trying to select a picture.
*/
const DropzoneLabel = styled.span`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  text-align: center;
  width: 100%;
  transition: all 100ms ease-out;
`;

const DropzoneLabelIcon = styled(Icon)`
  flex: 0 0 40px;
  height: 40px;
  width: 40px;
  fill: ${colors.textSecondary};
  margin-bottom: 4px;
  transition: all 100ms ease-out;
`;

const DropzoneImagesRemaining = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  line-height: normal;
  font-weight: 400;
  text-align: center;
  margin-top: 5px;
  transition: all 100ms ease-out;
`;

const DropzoneInput = styled.input``;

const DropzoneContent = styled.div<{ borderRadius?: string }>`
  box-sizing: border-box;
  border: 1px dashed ${colors.borderDark};
  border-radius: ${(props) =>
    props.borderRadius ? props.borderRadius : props.theme.borderRadius};
  position: relative;
  cursor: pointer;
  background: transparent;
  transition: all 100ms ease-out;
  outline: none;

  &:not(.disabled) {
    &:focus-within {
      ${defaultOutline};
    }

    &:hover,
    &:focus-within {
      border-color: #000;

      ${DropzoneLabel},
      ${DropzoneImagesRemaining} {
        color: #000;
      }

      ${DropzoneLabelIcon} {
        fill: #000;
      }
    }
  }

  &.disabled {
    cursor: no-drop;
    border-color: #ccc;

    ${DropzoneLabel},
    ${DropzoneImagesRemaining} {
      color: #ccc;
    }

    ${DropzoneLabelIcon} {
      fill: #ccc;
    }
  }
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

const Image = styled.div<{
  borderRadius: string | undefined;
  src: string;
  objectFit: 'cover' | 'contain' | undefined;
}>`
  background-repeat: no-repeat;
  background-position: center center;
  background-size: ${(props) => props.objectFit};
  background-image: url(${(props) => props.src});
  position: relative;
  box-sizing: border-box;
  border-radius: ${(props) =>
    props.borderRadius ? props.borderRadius : props.theme.borderRadius};
  border: solid 1px #ccc;
  transition: all 100ms ease-out;
`;

const Box = styled.div<{ maxWidth: string | undefined; ratio: number }>`
  width: 100%;
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : '100%')};
  position: relative;

  &.hasRightMargin {
    margin-right: 20px;
  }

  ${Image},
  ${DropzoneContent} {
    width: 100%;
    height: ${({ maxWidth, ratio }) => (ratio !== 1 ? 'auto' : maxWidth)};
    padding-bottom: ${({ ratio }) => `${Math.round(ratio * 100)}%`};
  }
`;

export interface Props {
  id?: string;
  images: UploadFile[] | null;
  acceptedFileTypes?: Accept;
  imagePreviewRatio: number;
  maxImagePreviewWidth?: string;
  maxImageFileSize?: number;
  maxNumberOfImages?: number;
  label?: string | JSX.Element | null | undefined;
  errorMessage?: string | null | undefined;
  objectFit?: 'cover' | 'contain' | undefined;
  onAdd: (arg: UploadFile[]) => void;
  // The type of arg is wrong, the returned File object's attributes don't match
  // UploadFile. Leaving the note for someone working on this in the future.
  onRemove: (arg: UploadFile) => void;
  borderRadius?: string;
  removeIconAriaTitle?: string;
  className?: string;
  previewOverlayElement?: JSX.Element | null;
}

interface State {
  urlObjects: {
    [key: string]: string;
  };
  errorMessage: string | null;
}

class ImagesDropzone extends PureComponent<
  Props & WrappedComponentProps,
  State
> {
  static defaultProps = {
    maxNumberOfImages: 1,
    maxImageFileSize: 10000000,
    addImageOverlay: false,
  };

  constructor(props: Props & WrappedComponentProps) {
    super(props);
    this.state = {
      urlObjects: {},
      errorMessage: null,
    };
  }

  componentDidMount() {
    forEach(this.state.urlObjects, (urlObject) =>
      window.URL.revokeObjectURL(urlObject)
    );

    this.setUrlObjects();
    this.removeExcessImages();

    if (this.props.errorMessage) {
      this.setState({ errorMessage: this.props.errorMessage });
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.images !== this.props.images) {
      this.setUrlObjects();
    }

    if (!prevProps.images || prevProps.images.length === 0) {
      this.removeExcessImages();
    }

    if (prevProps.errorMessage !== this.props.errorMessage) {
      const errorMessage =
        this.props.errorMessage &&
        this.props.errorMessage !== this.state.errorMessage
          ? this.props.errorMessage
          : this.state.errorMessage;
      this.setState({ errorMessage });
    }
  }

  removeExcessImages = () => {
    const {
      maxNumberOfImages = ImagesDropzone.defaultProps.maxNumberOfImages,
      images,
      onRemove,
    } = this.props;
    // Logic to automatically trigger removal of the images that exceed the maxNumberOfImages treshold
    // E.g. the maxNumberOfImages has been reduced from 5 to 1, but the server still returns 5 images and so this.props.images
    // array will have a length of 5 instead of the new max. allowed length of 1. In this case onRemove() will be triggered
    // for this.props.images[1] up to this.props.images[4] when this.props.images is loaded
    if (images && images.length > maxNumberOfImages) {
      for (let step = maxNumberOfImages; step < images.length; step += 1) {
        onRemove(images[step]);
      }
    }
  };

  setUrlObjects = () => {
    const images = this.props.images || [];
    const { urlObjects } = this.state;
    const newUrlObjects = {};

    images
      .filter((image) => image.base64 && !urlObjects[image.base64])
      .forEach((image) => {
        if (image.base64.startsWith('data:')) {
          // Handle base64 strings
          const blob = base64ToBlob(image.base64);
          if (blob) {
            newUrlObjects[image.base64] = window.URL.createObjectURL(blob);
          }
        } else {
          // Handle File or Blob objects
          newUrlObjects[image.base64] = window.URL.createObjectURL(image);
        }
      });

    forEach(urlObjects, (urlObject, key) => {
      if (!images.some((image) => image.base64 === key)) {
        window.URL.revokeObjectURL(urlObject);
      } else {
        newUrlObjects[key] = urlObject;
      }
    });

    this.setState({ urlObjects: newUrlObjects });
  };

  onDrop = async (images: UploadFile[]) => {
    const { formatMessage } = this.props.intl;
    const maxItemsCount = this.props.maxNumberOfImages;
    const oldItemsCount = size(this.props.images);
    const newItemsCount = size(images);
    const remainingItemsCount = maxItemsCount
      ? maxItemsCount - oldItemsCount
      : null;

    this.setState({ errorMessage: null });

    if (
      maxItemsCount &&
      remainingItemsCount &&
      newItemsCount > remainingItemsCount
    ) {
      const errorMessage =
        maxItemsCount === 1
          ? formatMessage(messages.onlyOneImage)
          : formatMessage(messages.onlyXImages, { maxItemsCount });
      this.setState({ errorMessage });
      setTimeout(() => this.setState({ errorMessage: null }), 6000);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (images && images.length > 0) {
      for (let i = 0; i < images.length; i += 1) {
        if (!images[i].base64) {
          try {
            images[i].base64 = await getBase64FromFile(images[i]);
          } catch (error) {
            reportError(error);
          }
        }
      }

      this.props.onAdd(
        uniqBy([...(this.props.images || []), ...images], 'base64')
      );
    }
  };

  onDropRejected = (images: UploadFile[]) => {
    const { formatMessage } = this.props.intl;
    const maxImageSizeInMb = this.getMaxImageSizeInMb();

    if (images.some((image) => image.size / 1000000 > maxImageSizeInMb)) {
      const maxSizeExceededErrorMessage =
        images.length === 1 || this.props.maxNumberOfImages === 1
          ? messages.errorImageMaxSizeExceeded
          : messages.errorImagesMaxSizeExceeded;
      const errorMessage = formatMessage(maxSizeExceededErrorMessage, {
        maxFileSize: maxImageSizeInMb,
      });
      this.setState({ errorMessage });
      setTimeout(() => this.setState({ errorMessage: null }), 6000);
    }
  };

  removeImage = (removedImage: UploadFile) => (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onRemove(removedImage);
  };

  getMaxImageSizeInMb = () => {
    const { maxImageFileSize = ImagesDropzone.defaultProps.maxImageFileSize } =
      this.props;

    return maxImageFileSize / 1000000;
  };

  render() {
    const {
      id,
      images,
      maxImageFileSize = ImagesDropzone.defaultProps.maxImageFileSize,
      maxNumberOfImages = ImagesDropzone.defaultProps.maxNumberOfImages,
      maxImagePreviewWidth,
      imagePreviewRatio,
      borderRadius,
      className,
      previewOverlayElement,
    } = this.props;
    const { formatMessage } = this.props.intl;
    const { errorMessage } = this.state;
    const remainingImages =
      maxNumberOfImages && maxNumberOfImages !== 1
        ? `(${maxNumberOfImages - size(images)} ${formatMessage(
            messages.remaining
          )})`
        : null;
    const maxImageSizeInMb = this.getMaxImageSizeInMb();
    const label =
      this.props.label ||
      (maxNumberOfImages && maxNumberOfImages === 1
        ? formatMessage(messages.uploadImageLabel, { maxImageSizeInMb })
        : formatMessage(messages.uploadMultipleImagesLabel));
    const objectFit = this.props.objectFit || 'cover';

    return (
      <Container className={className || ''} data-testid="images-dropzone">
        <ContentWrapper>
          {(maxNumberOfImages > 1 ||
            (maxNumberOfImages === 1 && isEmpty(images))) && (
            <Box
              maxWidth={maxImagePreviewWidth}
              ratio={imagePreviewRatio}
              className={
                images && maxNumberOfImages > 1 && images.length > 0
                  ? 'hasRightMargin'
                  : ''
              }
            >
              <Dropzone
                accept={this.props.acceptedFileTypes}
                maxSize={maxImageFileSize}
                disabled={!!(images && maxNumberOfImages === images.length)}
                onDrop={this.onDrop as any}
                onDropRejected={this.onDropRejected as any}
              >
                {({ getRootProps, getInputProps }) => {
                  return (
                    <DropzoneContent
                      {...getRootProps()}
                      borderRadius={borderRadius}
                      className={
                        images && maxNumberOfImages === images.length
                          ? 'disabled'
                          : ''
                      }
                    >
                      <DropzoneInput
                        {...getInputProps()}
                        id={id}
                        data-testid="dropzone-input"
                      />
                      <DropzoneContentInner>
                        <DropzoneLabelIcon name="upload-image" ariaHidden />
                        <DropzoneLabel>{label}</DropzoneLabel>
                        {remainingImages && (
                          <DropzoneImagesRemaining>
                            {remainingImages}
                          </DropzoneImagesRemaining>
                        )}
                      </DropzoneContentInner>
                    </DropzoneContent>
                  );
                }}
              </Dropzone>
            </Box>
          )}

          {images &&
            images.length > 0 &&
            images.slice(0, maxNumberOfImages).map((image, index) => (
              <Box
                key={index}
                maxWidth={maxImagePreviewWidth}
                ratio={imagePreviewRatio}
                className={
                  // TODO: Fix this the next time the file is edited.
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  images && maxNumberOfImages > 1 && index !== images.length - 1
                    ? 'hasRightMargin'
                    : ''
                }
              >
                <Image
                  borderRadius={borderRadius}
                  src={this.state.urlObjects[image.base64]}
                  objectFit={objectFit}
                >
                  <RemoveImageButton
                    onClick={this.removeImage(image)}
                    removeIconAriaTitle={this.props.removeIconAriaTitle}
                  />
                </Image>
                {previewOverlayElement}
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

export default injectIntl(ImagesDropzone);
