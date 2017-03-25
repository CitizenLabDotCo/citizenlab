/**
*
* AttachmentList
*
*/

import React, { PropTypes } from 'react';
import { Label, Button, Row, Column } from 'components/Foundation';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import Attachment from './Attachment';
import messages from './messages';

class AttachmentList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    this.state = {
      attachments: [],
    };

    // set necessary bindings
    this.onFileUpload = this.onFileUpload.bind(this);
  }

  componentDidMount() {
    this.props.loadAttachments();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      attachments: nextProps.attachments,
    });
  }

  onFileUpload(e) {
    const files = e.target.files;

    if (files.length < 1) {
      this.props.storeAttachment(null);
    } else {
      this.props.storeAttachment(files[0]);
    }
  }

  render() {
    const FileInput = (props) => (
      <input
        type="file"
        onChange={this.onFileUpload}
        className={props.className}
      />
    );

    const StyledFileInput = styled(FileInput)`
      opacity: 0;
      z-index: 1;
      width: 100px;
      margin-left: 10px;
      display: inline-block;
      position: absolute;
      height: 120px;
    `;

    const FileButton = (props) => (
      <Button className={props.className}>
        <FormattedMessage {...messages.clickToUpload} />
      </Button>
    );
    const StyledFileButton = styled(FileButton)`
      width: 100px;
      margin: 10px;
      z-index: 2;
    `;

    const { attachments, loadAttachmentsError, storeAttachmentError } = this.props;

    return (
      <div>
        {loadAttachmentsError && <Label>
          <FormattedMessage {...messages.loadAttachmentsError} />
        </Label>}
        {storeAttachmentError && <Label>
          <FormattedMessage {...messages.storeAttachmentError} />
        </Label>}
        <Row>
          {attachments.map((attachment, index) =>
            (<Column large={3} key={index}>
              <Attachment
                source={attachment}
              />
            </Column>)
          )}
          <Column large={3}>
            <StyledFileInput />
            <StyledFileButton />
          </Column>
        </Row>
      </div>
    );
  }
}

AttachmentList.propTypes = {
  loadAttachments: PropTypes.func.isRequired,
  storeAttachment: PropTypes.func.isRequired,
  attachments: PropTypes.any.isRequired,
  loadAttachmentsError: PropTypes.bool.isRequired,
  storeAttachmentError: PropTypes.bool.isRequired,
};

export default AttachmentList;
