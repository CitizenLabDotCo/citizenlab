import * as React from 'react';
import * as Dropzone from 'react-dropzone';
import * as _ from 'lodash';
import { media } from 'utils/styleUtils';
import { darken } from 'polished';
import Icon from 'components/UI/Icon';
import Error from 'components/UI/Error';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';
import styled from 'styled-components';
import { getBase64FromFile, createObjectUrl, revokeObjectURL } from 'utils/imageTools';
import { ImageFile } from 'typings';

const Container = styled.div`
  width: 100%;
  display: column;
`;

const ContentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap
`;

const ErrorWrapper = styled.div`
  flex: 1;
  margin-top: -12px;
`;

const DropzoneContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const DropzonePlaceholderText = styled.div`
  color: #aaa;
  font-size: 16px;
  line-height: 20px;
  font-weight: 400;
  text-align: center;
`;

const DropzonePlaceholderIcon = styled(Icon)`
  height: 32px;
  fill: #aaa;
  margin-bottom: 5px;
`;

const DropzoneImagesRemaining = styled.div`
  color: #aaa;
  font-size: 14px;
  line-height: 18px;
  font-weight: 400;
  text-align: center;
  margin-top: 6px;
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
  border-radius: 5px;
  border-color: #999;
  border-width: 1.5px;
  border-style: dashed;
  position: relative;
  cursor: pointer;
  background: #fff;

  &:hover {
    border-color: #000;

    ${DropzonePlaceholderText},
    ${DropzoneImagesRemaining} {
      color: #000;
    }

    ${DropzonePlaceholderIcon} {
      fill: #000;
    }
  }
`;

const Image: any = styled.div`
  background-repeat: no-repeat;
  background-position: center center;
  background-size: ${(props: any) => props.objectFit};
  background-image: url(${(props: any) => props.src});
  position: relative;
  border-radius: 5px;
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
  fill: #333;
`;

const RemoveButton: any = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -16px;
  right: -16px;
  z-index: 1;
  cursor: pointer;
  border-radius: 50%;
  border: solid 2.5px #fff;
  border-color: ${(props: any) => props.removeButtonBorderColor};
  background: #ddd;

  &:hover {
    background: #d0d0d0;

    ${RemoveIcon} {
      fill: #000;
    }
  }
`;


type Props = {
  images: ImageFile[] | null;
  acceptedFileTypes?: string | null | undefined;
  imagePreviewRatio?: number
  maxImagePreviewWidth?: string;
  maxImageFileSize?: number;
  maxNumberOfImages?: number;
  placeholder?: string | null | undefined;
  errorMessage?: string | null | undefined;
  objectFit?: 'cover' | 'contain' | undefined;
  removeButtonBorderColor?: string | undefined;
  onAdd: (arg: ImageFile) => void;
  onUpdate: (arg: ImageFile[] | null) => void;
  onRemove: (arg: ImageFile) => void;
};

type State = {
  images: ImageFile[] | null;
  errorMessage: string | null;
};

class ImagesDropzone extends React.PureComponent<Props & InjectedIntlProps, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {
      images: [],
      errorMessage: null
    };
  }

  async componentWillMount() {
    if (_.size(this.props.images) > 0) {
      const images = await this.getImageFiles(this.props.images);
      this.props.onUpdate(images);
      this.setState({ images });
    }
  }

  componentWillUnmount() {
    const { images } = this.props;

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i += 1) {
        const image  = images[i];

        if (image && image.objectUrl) {
          revokeObjectURL(image.objectUrl);
        }
      }
    }
  }

  async componentWillReceiveProps(nextProps: Props) {
    const { maxNumberOfImages } = this.props;

    if (nextProps.images !== this.props.images && (!maxNumberOfImages || (maxNumberOfImages && (_.size(nextProps.images) <= maxNumberOfImages)))) {
      const images = await this.getImageFiles(nextProps.images);
      this.setState({ images });
    }

    this.setState((state: State) => ({ errorMessage: (nextProps.errorMessage || state.errorMessage) }));
  }

  getImageFiles = async (images: ImageFile[] | null) => {
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i += 1) {
        if (!_.has(images[i], 'base64')) {
          images[i]['base64'] = await getBase64FromFile(images[i]);
        }

        if (!_.has(images[i], 'objectUrl')) {
          images[i]['objectUrl'] = createObjectUrl(images[i]);
        }
      }
    }

    return images;
  }

  onDrop = async (images: ImageFile[]) => {
    const { formatMessage } = this.props.intl;
    const maxItemsCount = this.props.maxNumberOfImages;
    const oldItemsCount = _.size(this.props.images);
    const newItemsCount = _.size(images);
    const remainingItemsCount = (maxItemsCount ? maxItemsCount - oldItemsCount : null);

    this.setState({ errorMessage: null });

    if (maxItemsCount && remainingItemsCount && newItemsCount > remainingItemsCount) {
      const errorMessage = (maxItemsCount === 1 ? formatMessage(messages.onlyOneImage) : formatMessage(messages.onlyXImages, { maxItemsCount }));
      this.setState({ errorMessage });
      setTimeout(() => this.setState({ errorMessage: null }), 6000);
    } else {
      const imagesWithPreviews = await this.getImageFiles(images);
      _(imagesWithPreviews).forEach((image) => this.props.onAdd(image));
    }
  }

  onDropRejected = (images: ImageFile[]) => {
    const { formatMessage } = this.props.intl;
    const maxSize = this.props.maxImageFileSize || 5000000;

    if (images.some(image => image.size > maxSize)) {
      const maxSizeExceededErrorMessage = (images.length === 1 || this.props.maxNumberOfImages === 1 ? messages.errorImageMaxSizeExceeded : messages.errorImagesMaxSizeExceeded);
      const errorMessage = formatMessage(maxSizeExceededErrorMessage, { maxFileSize: maxSize / 1000000 });
      this.setState({ errorMessage });
      setTimeout(() => this.setState({ errorMessage: null }), 6000);
    }
  }

  removeImage = (removedImage: ImageFile) => (event: React.FormEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();

    if (removedImage && removedImage.objectUrl) {
      revokeObjectURL(removedImage.objectUrl);
    }

    this.props.onRemove(removedImage);
  }

  render() {
    let { acceptedFileTypes, placeholder, objectFit, removeButtonBorderColor } = this.props;
    let { images } = this.state;
    const { maxImageFileSize, maxNumberOfImages, maxImagePreviewWidth, imagePreviewRatio } = this.props;
    const { formatMessage } = this.props.intl;
    const { errorMessage } = this.state;
    const remainingImages = (maxNumberOfImages && maxNumberOfImages !== 1 ? `(${maxNumberOfImages - _.size(images)} ${formatMessage(messages.remaining)})` : null);

    images = (_.compact(images) || null);
    acceptedFileTypes = (acceptedFileTypes || '*');
    placeholder = (placeholder || (maxNumberOfImages && maxNumberOfImages === 1 ? formatMessage(messages.dropYourImageHere) : formatMessage(messages.dropYourImagesHere)));
    objectFit = (objectFit || 'cover');
    removeButtonBorderColor = (removeButtonBorderColor || '#fff');

    const imageList = ((images && images.length > 0) ? (
      images.map((image, index) => {
        const hasSpacing = (maxNumberOfImages !== 1 && index !== 0 ? 'hasSpacing' : '');

        return (
          <Box
            key={index}
            maxWidth={maxImagePreviewWidth}
            ratio={imagePreviewRatio}
            className={hasSpacing}
          >
            <Image src={image.objectUrl} objectFit={objectFit}>
              <RemoveButton onClick={this.removeImage(image)} removeButtonBorderColor={removeButtonBorderColor}>
                <RemoveIcon name="close2" />
              </RemoveButton>
            </Image>
          </Box>
        );
      }).reverse()
    ) : null);

    const imageDropzone = ((!maxNumberOfImages || images.length < maxNumberOfImages) ? (
      <Box
        maxWidth={maxImagePreviewWidth}
        ratio={imagePreviewRatio}
        className={(images && images.length > 0 ? 'hasSpacing' : '')}
      >
        <StyledDropzone
          accept={acceptedFileTypes}
          maxSize={maxImageFileSize}
          disablePreview={true}
          onDrop={this.onDrop}
          onDropRejected={this.onDropRejected}
        >
          <DropzoneContent>
            <DropzonePlaceholderIcon name="upload" />
            <DropzonePlaceholderText>{placeholder}</DropzonePlaceholderText>
            <DropzoneImagesRemaining>{remainingImages}</DropzoneImagesRemaining>
          </DropzoneContent>
        </StyledDropzone>
      </Box>
    ) : null);

    return (
      <Container>
        <ContentWrapper>
          {imageDropzone}
          {imageList}
        </ContentWrapper>

        <ErrorWrapper>
          <Error text={errorMessage} />
        </ErrorWrapper>
      </Container>
    );
  }
}

export default injectIntl<Props>(ImagesDropzone);
