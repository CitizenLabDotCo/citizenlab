/**
*
* AttachmentList
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Button, List, Input, Label } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getFromState } from 'utils/immutables';

import { selectSubmitIdea } from './selectors';
import Attachment from './Attachment';
import messages from './messages';

export const Attachments = (props) => (<List>
  {props.attachments.map((attachment, index) => (
    <Attachment
      key={index}
      file={attachment}
    />
  ))}</List>
);

const FileInput = (props) => (
  <Input
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
  position: absolute !important; // override SUI's position
  height: 4rem;
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
      height: 4rem;
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
        <Segment>
          <AttachmentsStyled attachments={attachments} />
          <div>
            <StyledFileInput onFileUpload={this.onFileUpload} />
            <StyledFileButton />
          </div>
        </Segment>
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

const mapStateToProps = createStructuredSelector({
  ideasNewPageState: selectSubmitIdea,
});

const mergeProps = ({ ideasNewPageState: pageState }) => ({
  attachments: getFromState(pageState, 'draft', 'attachments'),
  storeAttachmentError: getFromState(pageState, 'draft', 'storeAttachmentError'),
});

export default styled(connect(mapStateToProps, null, mergeProps)(AttachmentList))`
  // none yet
`;
