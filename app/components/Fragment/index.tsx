import React from 'react';

import styled from 'styled-components';
import GetTenant from 'resources/GetTenant';

const StyledIframe = styled.iframe`
  border: 0;
`;

type Props = {
  name: string;
  tenantId: string;
  children?: JSX.Element | null;
};

type State = {
  fragmentExists?: boolean;
};

/**
 * Wrap content in a named fragment to allow the content to be overridden
 * for a specific tenant
*/
class Fragment extends React.Component<Props, State> {

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

    render() {
      const { children } = this.props;
      const { fragmentExists } = this.state;

      if (fragmentExists) {
      return (
        <StyledIframe src={this.fragmentUrl()} />
      );
    } else if (fragmentExists === false) {
      return children;
    } else return null;
  }
}


export default (inputProps) => (
  <GetTenant>
    {(tenant) => tenant ? <Fragment {...inputProps} tenantId={tenant.id} /> : null}
  </GetTenant>
);
