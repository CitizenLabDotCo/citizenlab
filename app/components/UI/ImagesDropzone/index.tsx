import * as React from 'react';
import * as Dropzone from 'react-dropzone';
import * as _ from 'lodash';
import Icon from 'components/UI/Icon';
import Spinner from 'components/UI/Spinner';
import Error from 'components/UI/Error';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import styled, { css } from 'styled-components';
import { getBase64FromFile, createObjectUrl, revokeObjectURL } from 'utils/imageTools';
import { ImageFile } from 'typings';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import shallowCompare from 'utils/shallowCompare';

const Container = styled.div`
  width: 100%;
  display: column;
`;

const ContentWrapper = styled(TransitionGroup)`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
`;

const ErrorWrapper = styled.div`
  flex: 1;
  margin-top: -12px;
`;

const DropzonePlaceholderText = styled.div`
  color: #aaa;
  font-size: 16px;
  line-height: 20px;
  font-weight: 400;
  text-align: center;
  transition: all 100ms ease-out;
`;

const DropzonePlaceholderIcon = styled(Icon)`
  height: 32px;
  fill: #aaa;
  margin-bottom: 5px;
  transition: all 100ms ease-out;
`;

const DropzoneImagesRemaining = styled.div`
  color: #aaa;
  font-size: 14px;
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
  border-radius: 5px;
  border-color: #666;
  border-width: 1.5px;
  border-style: dashed;
  position: relative;
  cursor: pointer;
  background: #fff;
  transition: all 100ms ease-out;

  &.canDrop {
    border-color: #006400;

    ${DropzonePlaceholderText},
    ${DropzoneImagesRemaining} {
      color: #000;
    }

    ${DropzonePlaceholderIcon} {
      fill: #000;
    }
  }

  &.cannotDrop {
    cursor: no-drop !important;
    border-color: #8b0000;

    ${DropzonePlaceholderText},
    ${DropzoneImagesRemaining} {
      color: #ccc;
    }

    ${DropzonePlaceholderIcon} {
      fill: #ccc;
    }
  }

  ${(props: any) => props.disabled ? css`
    cursor: not-allowed;
    border-color: #ccc;

    ${DropzonePlaceholderText},
    ${DropzoneImagesRemaining} {
      color: #ccc;
    }

    ${DropzonePlaceholderIcon} {
      fill: #ccc;
    }
  ` : css`
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
  `}
`;

const Image: any = styled.div`
  background-repeat: no-repeat;
  background-position: center center;
  background-size: ${(props: any) => props.objectFit};
  background-image: url(${(props: any) => props.src});
  position: relative;
  box-sizing: border-box;
  border-radius: ${(props: any) => props.imageRadius ? props.imageRadius : '5px'};
  border: solid 1px #ccc;
`;

const Box: any = styled.div`
  width: 100%;
  max-width: ${(props: any) => props.maxWidth ? props.maxWidth : '100%'};
  margin-bottom: 16px;
  position: relative;
  will-change: auto;

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

  &.animate {
    &.image-enter {
      opacity: 0;
      width: 0px;
      transition: all 300ms cubic-bezier(0.165, 0.84, 0.44, 1) 2000ms;
      will-change: opacity, width;

      &.hasSpacing {
        margin-right: 0px;
      }

      &.image-enter-active {
        opacity: 1;
        width: 100%;

        &.hasSpacing {
          margin-right: 20px;
        }
      }
    }

    &.image-exit {
      opacity: 1;
      width: 100%;
      transition: all 300ms cubic-bezier(0.165, 0.84, 0.44, 1);
      will-change: opacity, width;

      &.hasSpacing {
        margin-right: 20px;
      }

      &.image-exit-active {
        opacity: 0;
        width: 0px;

        &.hasSpacing {
          margin-right: 0px;
        }
      }
    }
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
  z-index: 1;
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

type Props = {
  images: ImageFile[] | null;
  acceptedFileTypes?: string | null | undefined;
  imagePreviewRatio?: number
  maxImagePreviewWidth?: string;
  maxImageFileSize?: number;
  maxNumberOfImages?: number;
  placeholder?: string | JSX.Element | null | undefined;
  errorMessage?: string | null | undefined;
  objectFit?: 'cover' | 'contain' | undefined;
  onAdd: (arg: ImageFile) => void;
  onUpdate: (arg: ImageFile[] | null) => void;
  onRemove: (arg: ImageFile) => void;
  imageRadius?: string;
};

type State = {
  images: ImageFile[] | null;
  errorMessage: string | null;
  processing: boolean;
  canAnimate: boolean;
  canAnimateTimeout: any;
};

class ImagesDropzone extends React.PureComponent<Props & InjectedIntlProps, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {
      images: [],
      errorMessage: null,
      processing: false,
      canAnimate: false,
      canAnimateTimeout: null
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
    if (!shallowCompare(this.props, nextProps)) {
      const images = (nextProps.images !== this.state.images ? await this.getImageFiles(nextProps.images) : this.state.images);
      const errorMessage = (nextProps.errorMessage && nextProps.errorMessage !== this.state.errorMessage ? nextProps.errorMessage : this.state.errorMessage);
      const processing = (this.state.canAnimate && !errorMessage && _.size(images) > _.size(this.state.images));

      if (processing) {
        setTimeout(() => this.setState({ processing: false }), 1800);
      }

      this.setState({
        images,
        errorMessage,
        processing
      });
    }
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

    this.setState((state: State) => {
      if (state.canAnimateTimeout !== null) {
        clearTimeout(state.canAnimateTimeout);
      }

      return {
        errorMessage: null,
        canAnimate: true,
        canAnimateTimeout: setTimeout(() => this.setState({ canAnimate: false, canAnimateTimeout: null }), 5000)
      };
    });

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

    this.setState((state: State) => {
      if (state.canAnimateTimeout !== null) {
        clearTimeout(state.canAnimateTimeout);
      }

      return {
        canAnimate: true,
        canAnimateTimeout: setTimeout(() => this.setState({ canAnimate: false, canAnimateTimeout: null }), 1000)
      };
    });

    setTimeout(() => this.props.onRemove(removedImage), 50);

    if (removedImage && removedImage.objectUrl) {
      revokeObjectURL(removedImage.objectUrl);
    }
  }

  render() {
    let { acceptedFileTypes, placeholder, objectFit } = this.props;
    let { images } = this.state;
    const className = this.props['className'];
    const { maxImageFileSize, maxNumberOfImages, maxImagePreviewWidth, imagePreviewRatio, imageRadius } = this.props;
    const { formatMessage } = this.props.intl;
    const { errorMessage, processing, canAnimate } = this.state;
    const remainingImages = (maxNumberOfImages && maxNumberOfImages !== 1 ? `(${maxNumberOfImages - _.size(images)} ${formatMessage(messages.remaining)})` : null);

    images = (_.compact(images) || null);
    acceptedFileTypes = (acceptedFileTypes || '*');
    placeholder = (placeholder || (maxNumberOfImages && maxNumberOfImages === 1 ? formatMessage(messages.dropYourImageHere) : formatMessage(messages.dropYourImagesHere)));
    objectFit = (objectFit || 'cover');

    const imageList = ((images && images.length > 0 && (maxNumberOfImages !== 1 || (maxNumberOfImages === 1 && !processing))) ? (
      images.map((image, index) => {
        const hasSpacing = (maxNumberOfImages !== 1 && index !== 0 ? 'hasSpacing' : '');
        const animate = (canAnimate && maxNumberOfImages !== 1 ? 'animate' : '');
        const timeout = !_.isEmpty(animate) ? { enter: 2300, exit: 300 } : 0;
        const enter = !_.isEmpty(animate);
        const exit = !_.isEmpty(animate);

        return (
          <CSSTransition key={image.objectUrl} classNames="image" timeout={timeout} enter={enter} exit={exit}>
            <Box
              key={index}
              maxWidth={maxImagePreviewWidth}
              ratio={imagePreviewRatio}
              className={`${hasSpacing} ${animate}`}
            >
              <Image imageRadius={imageRadius} src={image.objectUrl} objectFit={objectFit}>
                <RemoveButton onClick={this.removeImage(image)}>
                  <RemoveIcon name="close2" />
                </RemoveButton>
              </Image>
            </Box>
          </CSSTransition>
        );
      }).reverse()
    ) : null);

    const imageDropzone = (
      processing ||
      (maxNumberOfImages && maxNumberOfImages > 1) ||
      (maxNumberOfImages && maxNumberOfImages === 1 && (!images || images.length < 1))
    ) ? (
      <CSSTransition classNames="image" timeout={0} enter={false} exit={false}>
        <Box
          maxWidth={maxImagePreviewWidth}
          ratio={imagePreviewRatio}
          className={(maxNumberOfImages !== 1 && images && images.length > 0 ? 'hasSpacing' : '')}
        >
          <StyledDropzone
            accept={acceptedFileTypes}
            maxSize={maxImageFileSize}
            activeClassName="canDrop"
            rejectClassName="cannotDrop"
            disabled={processing || maxNumberOfImages === images.length}
            disablePreview={true}
            onDrop={this.onDrop}
            onDropRejected={this.onDropRejected}
          >
            {!processing ? (
              <DropzoneContent>
                <DropzonePlaceholderIcon name="upload" />
                <DropzonePlaceholderText>{placeholder}</DropzonePlaceholderText>
                <DropzoneImagesRemaining>{remainingImages}</DropzoneImagesRemaining>
              </DropzoneContent>
            ) : (
              <DropzoneContent>
                <Spinner color="#666" size="32px" />
              </DropzoneContent>
            )}
          </StyledDropzone>
        </Box>
      </CSSTransition>
    ) : null;

    return (
      <Container className={className}>
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
