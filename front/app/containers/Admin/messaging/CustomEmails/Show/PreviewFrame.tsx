import React from 'react';
import styled from 'styled-components';
import { API_PATH } from 'containers/App/constants';
import Frame from 'react-frame-component';
import request from 'utils/request';

const StyledFrame = styled(Frame)`
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.separation};
  width: 100%;
  height: 450px;
`;

type Props = {
  campaignId: string;
  className?: string;
};

type State = {
  previewHtml?: string;
};

class PreviewFrame extends React.Component<Props, State> {
  iframeNode: HTMLIFrameElement;

  constructor(props) {
    super(props);
    this.state = {
      previewHtml: undefined,
    };
  }

  componentDidMount() {
    request<{ html: string }>(
      `${API_PATH}/campaigns/${this.props.campaignId}/preview`,
      null,
      null,
      null
    ).then((json) => {
      this.setState({ previewHtml: json.html });
    });
  }

  render() {
    const { previewHtml } = this.state;
    const { className } = this.props;

    if (!previewHtml) return null;

    return (
      <StyledFrame
        id="e2e-email-preview-iframe"
        className={className}
        initialContent={previewHtml}
      />
    );
  }
}

export default PreviewFrame;
