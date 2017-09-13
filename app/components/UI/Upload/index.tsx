import * as React from 'react';
import * as Dropzone from 'react-dropzone';
import * as _ from 'lodash';
import { media } from 'utils/styleUtils';
import { darken } from 'polished';
import Icon from 'components/UI/Icon';
import Error from 'components/UI/Error';
import { injectIntl, intlShape } from 'react-intl';
import messages from './messages';
import styled from 'styled-components';
import { API } from 'typings.d';

const UploadIcon = styled.div`
  height: 40px;
  margin-top: 5px;
  margin-bottom: 5px;

  svg {
    fill: #aaa;
  }
`;

const UploadMessage: any = styled.span`
  max-width: 80%;
  color: #aaa;
  font-size: 17px;
  line-height: 24px;
  font-weight: 400;
  text-align: center;
  margin-bottom: 5px;
`;

const StyledDropzone = styled(Dropzone)`
  width: 100%;
  min-height: 140px;
  display: flex;
  flex-wrap: wrap;
  border-radius: 5px;
  border-color: #999;
  border-width: 1.5px;
  border-style: dashed;
  padding: 20px;
  padding-bottom: 0px;
  position: relative;
  background: #fff;

  ${media.smallPhone`
    flex-direction: column;
  `}
`;

const StyledDropzoneWrapper: any = styled.div`
  &:not(.disabled) ${StyledDropzone} {
    cursor: pointer;
  }

  &.disabled ${StyledDropzone} {
    cursor: default;
  }

  &:not(.disabled):hover,
  &:not(.disabled).dropzoneActive {
    ${StyledDropzone} {
      border-color: #000;
    }

    ${UploadIcon} {
      svg {
        fill: #000;
      }
    }

    ${UploadMessage} {
      color: #000;
    }
  }
`;

const UploadMessageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const UploadedItem = styled.div`
  margin-right: 0px;
  margin-bottom: 20px;
  border: solid 1px #ccc;
  border-radius: 5px;
  position: relative;
  background-size: cover;
  background-position: center center;

  ${media.notPhone`
    width: calc(33% - 13px);
    height: 130px;

    &:not(:nth-child(3n)) {
      margin-right: 20px;
    }
  `}

  ${media.phone`
    width: calc(50% - 10px);
    height: 130px;

    &:not(:nth-child(2n)) {
      margin-right: 20px;
    }
  `}

  ${media.smallPhone`
    width: 100%;
  `}
`;

const RemoveUploadedItem = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -16px;
  right: -16px;
  z-index: 1;
  border-radius: 50%;
  background: #fff;
`;

const RemoveUploadedItemInner = styled.div`
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ddd;
  cursor: pointer;

  &:hover {
    background: #ccc;
  }

  svg {
    height: 10px;
    fill: #333;
  }
`;

export interface ExtendedImageFile extends Dropzone.ImageFile {
  base64: string;
}

type Props = {
  intl: ReactIntl.InjectedIntl;
  items: Dropzone.ImageFile[] | null;
  apiImages?: API.ImageSizes[];
  accept?: string | null | undefined;
  maxSize?: number;
  maxItems?: number;
  placeholder?: string | null | undefined;
  disablePreview?: boolean;
  destroyPreview?: boolean;
  onAdd: (arg: Dropzone.ImageFile) => void;
  onRemove: (arg: Dropzone.ImageFile) => void;
  onRemoveApiImage?: (arg: API.ImageSizes) => void;
};

type State = {
  errorMessage: string | null;
  dropzoneActive: boolean;
  disabled: boolean;
};

class Upload extends React.PureComponent<Props, State> {
  private emptyArray: never[];

  public static defaultProps: Partial<Props> = {
    items: [],
    accept: '*',
    maxSize: 5000000,
    maxItems: 1,
    placeholder: 'Drop your file here',
  };

  constructor() {
    super();
    this.emptyArray = [];
    this.state = {
      errorMessage: null,
      dropzoneActive: false,
      disabled: false
    };
  }

  componentWillUnmount() {
    _(this.props.items).forEach(item => this.destroyPreview(item));
  }

  componentWillUpdate(nextProps, nextState) {
    const { items, maxItems } = this.props;

    if (maxItems && _.size(nextProps.items) >= maxItems) {
      this.setState({ disabled: true });
    } else {
      this.setState({ disabled: false });
    }
  }

  onDrop = (items: Dropzone.ImageFile[]) => {
    const { formatMessage } = this.props.intl;
    const maxItemsCount = this.props.maxItems;
    const oldItemsCount = _.size(this.props.items);
    const newItemsCount = _.size(items);
    const remainingItemsCount = (maxItemsCount ? maxItemsCount - oldItemsCount : null);

    this.setState({ errorMessage: null, dropzoneActive: false });

    if (!this.state.disabled) {
      if (maxItemsCount && remainingItemsCount && newItemsCount > remainingItemsCount) {
        const errorMessage = (maxItemsCount === 1 ? formatMessage(messages.onlyOneImage) : formatMessage(messages.onlyXImages, { maxItemsCount }));
        this.setState({ errorMessage });
        setTimeout(() => this.setState({ errorMessage: null }), 6000);
      } else {
        items.forEach(item => this.props.onAdd(item));
      }
    } else {
      const errorMessage = formatMessage(messages.limitReached);
      this.setState({ errorMessage });
      setTimeout(() => this.setState({ errorMessage: null }), 6000);
    }
  }

  onDragEnter = () => {
    this.setState(state => ({ dropzoneActive: (!state.disabled && true) || false }));
  }

  onDragLeave = () => {
    this.setState({ dropzoneActive: false });
  }

  onDropRejected = (items: Dropzone.ImageFile[]) => {
    const { formatMessage } = this.props.intl;
    const maxSize = this.props.maxSize || 5000000;

    if (items.some(item => item.size > maxSize)) {
      const errorMessage = formatMessage(messages.errorMaxSizeExceeded, { maxFileSize: maxSize / 1000000 });
      this.setState({ errorMessage, dropzoneActive: false });
      setTimeout(() => this.setState({ errorMessage: null }), 6000);
    }
  }

  removeItem = (item: Dropzone.ImageFile, event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    this.destroyPreview(item);
    this.props.onRemove(item);
  }

  removeApiImage = (image: API.ImageSizes, event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onRemoveApiImage ? this.props.onRemoveApiImage(image) : null;
  }

  destroyPreview(item: Dropzone.ImageFile) {
    if (this.props.destroyPreview && item && item.preview) {
      window.URL.revokeObjectURL(item.preview);
    }
  }

  render() {
    let { items, apiImages, accept, placeholder, disablePreview } = this.props;
    const { maxSize, maxItems } = this.props;
    const { errorMessage, dropzoneActive, disabled } = this.state;

    items = (_.compact(items) || this.emptyArray);
    apiImages = (_.compact(apiImages) || this.emptyArray);
    accept = (accept || '*');
    placeholder = (placeholder || 'Drop your file here');
    disablePreview = (_.isBoolean(disablePreview) ? disablePreview : false);

    const emptyDropzone = (_.isEmpty(items) && _.isEmpty(apiImages)) && (
      <UploadMessageContainer>
        <UploadIcon><Icon name="upload" /></UploadIcon>
        <UploadMessage dangerouslySetInnerHTML={{ __html: placeholder }} />
      </UploadMessageContainer>
    );

    const filledDropzone = (!_.isEmpty(items)) && (
      items.map((item, index) => {
        const _onClick = (event) => this.removeItem(item, event);
        return (
          <UploadedItem key={index} style={{ backgroundImage: `url(${item.preview})` }}>
            <RemoveUploadedItem onClick={_onClick}>
              <RemoveUploadedItemInner>
                {/* <IconWrapper> */}
                  <Icon name="close2" />
                {/* </IconWrapper> */}
              </RemoveUploadedItemInner>
            </RemoveUploadedItem>
          </UploadedItem>
        );
      })
    );

    const apiImagesDropzone = (!_.isEmpty(apiImages)) && (
      apiImages.map((image, index) => {
        const _onClick = (event) => this.removeApiImage(image, event);
        return (
          <UploadedItem key={index} style={{ backgroundImage: `url(${image.medium})` }}>
            <RemoveUploadedItem onClick={_onClick}>
              <RemoveUploadedItemInner>
                <Icon name="close2" />
              </RemoveUploadedItemInner>
            </RemoveUploadedItem>
          </UploadedItem>
        );
      })
    );

    return (
      <div>
        <StyledDropzoneWrapper
          className={`
            ${dropzoneActive ? 'dropzoneActive' : ''}
            ${disabled ? 'disabled' : ''}
          `}
        >
          <StyledDropzone
            disableClick={disabled}
            accept={accept}
            maxSize={maxSize}
            disablePreview={disablePreview}
            onDrop={this.onDrop}
            onDragEnter={this.onDragEnter}
            onDragLeave={this.onDragLeave}
            onDropRejected={this.onDropRejected}
          >
            {emptyDropzone}
            {filledDropzone}
            {apiImagesDropzone}
          </StyledDropzone>
        </StyledDropzoneWrapper>
        <Error text={errorMessage} />
      </div>
    );
  }
}

export default injectIntl(Upload);
