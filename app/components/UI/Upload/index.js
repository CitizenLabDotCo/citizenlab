import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { darken } from 'polished';
import Dropzone from 'react-dropzone';
import Icon from 'components/Icon';

const StyledDropzone = styled(Dropzone)`
  width: 100%;
  min-height: 120px;
  display: flex;
  border-radius: 5px;
  border: dashed 2px #999;
  padding: 15px;
  cursor: pointer;
  position: relative;
  background: transparent;

  &:hover {
    border-color: #000;
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

const UploadIcon = styled.div`
  height: 40px;
  margin-top: -10px;
  margin-bottom: 5px;

  svg {
    fill: #999;
  }
`;

const UploadMessage = styled.span`
    max-width: 200px;
    color: #999;
    font-size: 15px;
    line-height: 20px;
    font-weight: 300;
    text-align: center;
`;

const UploadedItem = styled.div`
  width: 150px;
  height: 120px;
  margin-right: 15px;
  border: solid 1px #999;
  border-radius: 5px;
  position: relative;
  background-size: cover;

  &:last-child {
    margin-right: 0px;
  }
`;

const RemoveUploadedItem = styled.div`
  width: 28px;
  height: 28px;
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 2;
  padding: 0px;
  border-radius: 50%;
  background: #f8f8f8;
  cursor: pointer;

  &:hover svg {
    fill: ${(props) => darken(0.15, (props.theme.accentFg || '#000'))};
  }

  svg {
    fill: ${(props) => props.theme.accentFg || '#777'};
  }
`;

class Upload extends React.Component {
  componentWillUnmount() {
    this.props.items.forEach((item) => {
      if (item.preview) {
        window.URL.revokeObjectURL(item.preview);
      }
    });
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

  removeItem = (items) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onRemove(items);
  };

  render() {
    const { items, placeholder, multiple, accept, maxSize } = this.props;

    return (
      <StyledDropzone
        multiple={multiple}
        accept={accept}
        maxSize={maxSize || Infinity}
        onDrop={this.handleOnDrop}
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
    );
  }
}

Upload.propTypes = {
  multiple: PropTypes.bool.isRequired,
  items: PropTypes.array.isRequired,
  accept: PropTypes.string.isRequired,
  maxSize: PropTypes.number,
  maxItems: PropTypes.number,
  placeholder: PropTypes.string.isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default Upload;
