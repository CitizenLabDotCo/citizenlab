import React from 'react';
import styled from 'styled-components';
import GetTenant from 'resources/GetTenant';
import { isNilOrError } from 'utils/helperUtils';

const StyledIframe = styled.iframe`
  border: 0;
  height: ${props => props.height ? `${props.height}px` : 'auto'};
`;

type Props = {
  name: string;
  tenantId: string;
  children?: JSX.Element | null;
};

type State = {
  fragmentExists?: boolean;
  iframeHeight?: number;
};

/**
 * Wrap content in a named fragment to allow the content to be overridden
 * for a specific tenant
*/
class Fragment extends React.Component<Props, State> {

  iframeNode: HTMLIFrameElement;

  constructor(props) {
    super(props);
    this.state = {
      fragmentExists: undefined,
    };
  }

  componentDidMount() {
    fetch(this.fragmentUrl())
    .then((response) => {
      if (response.ok) {
        this.setState({ fragmentExists: true });
      } else {
        throw('not found');
      }
    })
    .catch(() => {
      this.setState({ fragmentExists: false });
    });
  }

  fragmentUrl = () => `/fragments/${this.props.tenantId}/${this.props.name}.html`;

  setIframeRef = (ref) => {
    this.iframeNode = ref;
  }

  setIframeHeight = () => {
    if (this.iframeNode && this.iframeNode.contentWindow) {
      this.setState({
        iframeHeight: this.iframeNode.contentWindow.document.body.scrollHeight,
      });
    }
  }

  render() {
    const { children } = this.props;
    const { fragmentExists, iframeHeight } = this.state;

    if (fragmentExists) {
      return (
        <StyledIframe
          innerRef={this.setIframeRef}
          src={this.fragmentUrl()}
          height={iframeHeight}
          onLoad={this.setIframeHeight}
        />
      );
    } else if (fragmentExists === false) {
      return children;
    } else return null;
  }
}


export default (inputProps) => (
  <GetTenant>
    {(tenant) => !isNilOrError(tenant) ? <Fragment {...inputProps} tenantId={tenant.id} /> : null}
  </GetTenant>
);
