import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import { darken } from 'polished';
import Dropzone from 'react-dropzone';
import Icon from 'components/UI/Icon';
import Error from 'components/UI/Error';
import { injectIntl, intlShape } from 'react-intl';
import messages from './messages';
import _ from 'lodash';

const UploadIcon = styled.div`
  height: 40px;
  margin-top: 5px;
  margin-bottom: 5px;

  svg {
    fill: #aaa;
  }
`;

const UploadMessage = styled.span`
  max-width: 90%;
  color: #aaa;
  font-size: 17px;
  line-height: 20px;
  font-weight: 400;
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
  background: #fff;

  ${media.smallPhone`
    flex-direction: column;
  `}

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

const UploadedItem = styled.div`
  margin-right: 0px;
  margin-bottom: 20px;
  border: solid 1px #ccc;
  border-radius: 5px;
  position: relative;
  background-size: cover;

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
  width: 28px;
  height: 28px;
  position: absolute;
  top: -11px;
  right: -11px;
  z-index: 1;
  padding: 2px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;

  &:hover svg {
    fill: ${(props) => darken(0.2, (props.theme.color.main || '#000'))};
  }

  svg {
    fill: ${(props) => props.theme.color.main || '#777'};
  }
`;

class Upload extends React.Component {
  constructor() {
    super();
    this.state = { error: null };
  }

  componentWillUnmount() {
    _(this.props.items).filter((item) => item.preview).forEach((item) => this.destroyItem(item.preview));
  }

  handleOnDrop = (items) => {
    const maxItemsCount = this.props.maxItems;
    const oldItemsCount = _.size(this.props.items);
    const newItemsCount = _.size(items);
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
      this.setState({ error: formatMessage(messages.errorMaxSizeExceeded, { maxFileSize: this.props.maxSize / 1000000 }) });
      setTimeout(() => this.setState({ error: null }), 5000);
    }
  }

  removeItem = (item) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.destroyPreview(item);
    this.props.onRemove(item);
  };

  destroyPreview(item) {
    if (item.preview) {
      window.URL.revokeObjectURL(item.preview);
    }
  }

  render() {
    const { items, placeholder, accept, maxSize } = this.props;
    const { error } = this.state;

    return (
      <div>
        <StyledDropzone
          accept={accept}
          maxSize={maxSize}
          onDrop={this.handleOnDrop}
          onDropRejected={this.handleOnDropRejected}
        >
          { !items || items.length < 1
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
        <Error text={error} />
      </div>
    );
  }
}

Upload.propTypes = {
  intl: intlShape.isRequired,
  items: PropTypes.array,
  accept: PropTypes.string.isRequired,
  maxSize: PropTypes.number,
  maxItems: PropTypes.number,
  placeholder: PropTypes.string,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

Upload.defaultProps = {
  items: [],
  accept: '*',
  maxSize: 5000000,
  maxItems: 1,
  placeholder: 'Drop your file here',
};

export default injectIntl(Upload);
