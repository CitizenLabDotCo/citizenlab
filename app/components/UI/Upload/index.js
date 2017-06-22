import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { darken } from 'polished';
import Dropzone from 'react-dropzone';
import Icon from 'components/Icon';
import Error from 'components/UI/Error';
import { injectIntl, intlShape } from 'react-intl';
import messages from './messages';

const UploadIcon = styled.div`
  height: 40px;
  margin-top: 5px;
  margin-bottom: 5px;

  svg {
    fill: #999;
  }
`;

const UploadMessage = styled.span`
    max-width: 300px;
    color: #999;
    font-size: 15px;
    line-height: 20px;
    font-weight: 300;
    text-align: center;
    margin-bottom: 5px;
`;

const StyledDropzone = styled(Dropzone)`
  width: 100%;
  min-height: 120px;
  display: flex;
  flex-wrap: wrap;
  border-radius: 5px;
  border: dashed 1.5px #999;
  padding: 20px;
  padding-bottom: 0px;
  cursor: pointer;
  position: relative;
  background: transparent;

  &:hover {
    border-color: #000;

    ${UploadIcon} svg {
      fill: #000;
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
  width: calc(33% - 12px);
  height: 130px;
  margin-right: 20px;
  margin-bottom: 20px;
  border: solid 1px #aaa;
  border-radius: 5px;
  position: relative;
  background-size: cover;

  &:nth-child(3) {
    margin-right: 0px;
  }

  &:last-child {
    margin-right: 0px;
  }
`;

const RemoveUploadedItem = styled.div`
  width: 25px;
  height: 25px;
  position: absolute;
  top: -11px;
  right: -11px;
  z-index: 2;
  padding: 0px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;

  &:hover svg {
    fill: ${(props) => darken(0.20, (props.theme.accentFg || '#000'))};
  }

  svg {
    fill: ${(props) => props.theme.accentFg || '#777'};
  }
`;

class Upload extends React.Component {
  constructor() {
    super();
    this.state = {
      error: false,
      errorMessage: null,
    };
  }

  componentWillUnmount() {
    this.props.items.filter((item) => item.preview).forEach((item) => this.destroyItem(item.preview));
  }

  handleOnDrop = (items) => {
    const maxItemsCount = this.props.maxItems;
    const oldItemsCount = this.props.items.length;
    const newItemsCount = items.length;
    const remainingItemsCount = maxItemsCount - oldItemsCount;

    if (maxItemsCount && newItemsCount > remainingItemsCount) {
      items.slice(0, remainingItemsCount).forEach((item) => this.props.onAdd(item));
    } else {
      items.forEach((item) => this.props.onAdd(item));
    }
  };

  handleOnDropRejected = (items) => {
    if (items.some((item) => item.size > this.props.maxSize)) {
      const { formatMessage } = this.props.intl;

      this.setState({
        error: true,
        errorMessage: formatMessage(messages.errorMaxSizeExceeded, { maxFileSize: this.props.maxSize / 1000000 }),
      });

      setTimeout(() => {
        this.setState({
          error: false,
          errorMessage: null,
        });
      }, 5000);
    }
  }

  removeItem = (items) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    items.filter((item) => item.preview).forEach((item) => this.destroyPreview(item.preview));
    this.props.onRemove(items);
  };

  destroyPreview(itemPreview) {
    if (itemPreview) {
      window.URL.revokeObjectURL(itemPreview);
    }
  }

  render() {
    const { items, placeholder, multiple, accept, maxSize } = this.props;
    const { error, errorMessage } = this.state;

    return (
      <div>
        <StyledDropzone
          multiple={multiple}
          accept={accept}
          maxSize={maxSize || Infinity}
          onDrop={this.handleOnDrop}
          onDropRejected={this.handleOnDropRejected}
        >
          {!items || items.length < 1
            ? (
              <UploadMessageContainer>
                <UploadIcon><Icon name="upload" /></UploadIcon>
                <UploadMessage>{placeholder}</UploadMessage>
              </UploadMessageContainer>
            )
            : (
              items.map((item, index) => (
                <UploadedItem key={index} style={{ backgroundImage: `url(${item.preview})` }}>
                  <RemoveUploadedItem onClick={this.removeItem(item)}>
                    <Icon name="close" />
                  </RemoveUploadedItem>
                </UploadedItem>
              ))
            )
          }
        </StyledDropzone>
        <Error
          size="1"
          text={errorMessage}
          marginTop="10px"
          marginBottom="0px"
          opened={error}
          showIcon={false}
        />
      </div>
    );
  }
}

Upload.propTypes = {
  intl: intlShape.isRequired,
  multiple: PropTypes.bool.isRequired,
  items: PropTypes.array.isRequired,
  accept: PropTypes.string.isRequired,
  maxSize: PropTypes.number,
  maxItems: PropTypes.number,
  placeholder: PropTypes.string.isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default injectIntl(Upload);
