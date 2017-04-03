/**
*
* AttachmentList
*
*/

import React, { PropTypes } from 'react';
import { Button, Row, Column, Label } from 'components/Foundation';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import Attachment from './Attachment';
import messages from './messages';

export const Attachments = (props) => (<span>
  {props.attachments.map((attachment, index) =>
    (<Column large={3} key={index}>
      <Attachment
        source={attachment}
      />
    </Column>)
  )}</span>
);

const FileInput = (props) => (
  <input
    type="file"
    onChange={props.onFileUpload}
    className={props.className}
  />
);

export const StyledFileInput = styled(FileInput)`
  opacity: 0;
  z-index: 1;
  width: 100px;
  margin-left: 10px;
  display: inline-block;
  position: absolute;
  height: 120px;
`;

class AttachmentList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    this.state = {
      attachments: [],
    };

    // set necessary bindings
    this.onFileUpload = this.onFileUpload.bind(this);
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
    const FileButton = (props) => (
      <Button className={props.className}>
        <FormattedMessage {...messages.clickToUpload} />
      </Button>
    );

    const { attachments, storeAttachmentError } = this.props;

    const StyledFileButton = styled(FileButton)`
      width: 100px;
      margin: 10px;
      z-index: 2;
    `;

    const AttachmentsStyled = styled(Attachments)`
      // no style for now
    `;

    return (
      <div>
        {storeAttachmentError && <Label>
          <FormattedMessage {...messages.storeAttachmentError} />
        </Label>}
        <Row>
          <AttachmentsStyled attachments={attachments} />
          <Column large={3}>
            <StyledFileInput onFileUpload={this.onFileUpload} />
            <StyledFileButton />
          </Column>
        </Row>
      </div>
    );
  }
}

AttachmentList.propTypes = {
  attachments: PropTypes.any.isRequired,
  storeAttachment: PropTypes.func.isRequired,
  storeAttachmentError: PropTypes.bool.isRequired,
};

Attachments.propTypes = {
  attachments: PropTypes.any.isRequired,
};

FileInput.propTypes = {
  onFileUpload: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default AttachmentList;