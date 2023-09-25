import React from 'react';
import styled from 'styled-components';
import Frame from 'react-frame-component';
import { API_PATH } from 'containers/App/constants';

const StyledFrame = styled(Frame)`
  border-radius: ${(props) => props.theme.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.divider};
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

  constructor(props: Props) {
    super(props);
    this.state = {
      previewHtml: undefined,
    };
  }

  componentDidMount() {
    // TODO: Replace with fetcher when the backend is updated

    fetch(`${API_PATH}/campaigns/${this.props.campaignId}/preview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        this.setState({ previewHtml: data.html });
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
      >
        {this.props.children}
      </StyledFrame>
    );
  }
}

export default PreviewFrame;
