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
import { API } from 'typings.d';
import { getBase64, getBase64FromObjectUrl, generateImagePreview } from 'utils/imageTools';

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
  position: relative;

  ${media.biggerThanPhone`
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

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  border: solid 1px #ccc;
  border-radius: 5px;
  overflow: hidden;
  object-fit: cover;
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

type Props = {
  items: Dropzone.ImageFile[] | File[] | null;
  accept?: string | null | undefined;
  maxSize?: number;
  maxItems?: number;
  placeholder?: string | null | undefined;
  disallowDeletion?: boolean;
  onAdd: (arg: Dropzone.ImageFile) => void;
  onRemove: (arg: Dropzone.ImageFile) => void;
};

type State = {
  items: Dropzone.ImageFile[] | null;
  errorMessage: string | null;
  dropzoneActive: boolean;
  disabled: boolean;
};

class Upload extends React.PureComponent<Props & InjectedIntlProps, State> {
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
      items: [],
      errorMessage: null,
      dropzoneActive: false,
      disabled: false
    };
  }

  componentWillMount() {
    const { maxItems } = this.props;
    const items: File[] | Dropzone.ImageFile[] = [];

    if (this.props.items && this.props.items.length > 0) {
      for (let i = 0; i < this.props.items.length; i += 1) {
        const item = this.props.items[i];
        item['preview'] = generateImagePreview(item);
        items[i] = item;
      }
    }

    this.setState({
      items,
      disabled: (maxItems ? (_.size(this.props.items) >= maxItems) : false)
    });
  }

  componentWillReceiveProps(nextProps: Props) {
    const { maxItems } = this.props;

    if (nextProps.items !== this.props.items) {      
      this.setState({ disabled: (maxItems ? (_.size(nextProps.items) >= maxItems) : false) });

      if (!maxItems || (maxItems && (_.size(nextProps.items) <= maxItems))) {
        const items: File[] = [];

        if (this.state.items && this.state.items.length > 0) {
          for (let i = 0; i < this.state.items.length; i += 1) {
            this.destroyPreview(this.state.items[i]);
          }
        }

        if (nextProps.items && nextProps.items.length > 0) {
          for (let i = 0; i < nextProps.items.length; i += 1) {
            const item = nextProps.items[i];
            item['preview'] = generateImagePreview(item);
            items[i] = item;
          }
        }

        this.setState({ items });
      }
    }
  }

  componentWillUnmount() {
    if (this.state.items && this.state.items.length > 0) {
      for (let i = 0; i < this.state.items.length; i += 1) {
        this.destroyPreview(this.state.items[i]);
      }
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
    this.props.onRemove(item);
  }

  destroyPreview(item: Dropzone.ImageFile) {
    if (item && _.isString(item.preview) && !_.isEmpty(item.preview)) {
      window.URL.revokeObjectURL(item.preview);
    }
  }

  render() {
    let { accept, placeholder } = this.props;
    let { items } = this.state;
    const { maxSize, maxItems } = this.props;
    const { formatMessage } = this.props.intl;
    const { errorMessage, dropzoneActive, disabled } = this.state;

    items = (_.compact(items) || this.emptyArray);
    accept = (accept || '*');
    placeholder = (placeholder || formatMessage(messages.dropYourFileHere));

    const emptyDropzone = ((!items || items.length === 0) ? (
      <UploadMessageContainer>
        <UploadIcon><Icon name="upload" /></UploadIcon>
        <UploadMessage dangerouslySetInnerHTML={{ __html: placeholder }} />
      </UploadMessageContainer>
    ) : null);

    const filledDropzone = ((items && items.length > 0) ? (
      items.map((item, index) => {
        const _onClick = (event) => this.removeItem(item, event);

        return (
          <UploadedItem key={index} style={{ backgroundImage: `url(${item.preview ? item.preview : ''})` }}>
            <StyledImage src={item.preview} />
            {!this.props.disallowDeletion && <RemoveUploadedItem onClick={_onClick}>
              <RemoveUploadedItemInner>
                <Icon name="close2" />
              </RemoveUploadedItemInner>
            </RemoveUploadedItem>}
          </UploadedItem>
        );
      })
    ) : null);

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
            disablePreview={true}
            onDrop={this.onDrop}
            onDragEnter={this.onDragEnter}
            onDragLeave={this.onDragLeave}
            onDropRejected={this.onDropRejected}
          >
            {emptyDropzone}
            {filledDropzone}
          </StyledDropzone>
        </StyledDropzoneWrapper>
        <Error text={errorMessage} />
      </div>
    );
  }
}

export default injectIntl<Props>(Upload);
