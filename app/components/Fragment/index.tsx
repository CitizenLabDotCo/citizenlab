import React from 'react';

import Frame from 'react-frame-component';

import styled from 'styled-components';
import GetTenant from 'resources/GetTenant';
// import { globalCss } from 'global-styles';


const StyledFrame = styled(Frame)`
  border: 0;
`;

// Waiting for this PR to be merged, to support rendering styled components within an iframe
// https://github.com/styled-components/styled-components/pull/1491
// const InnerFragmentStyle = styled.div`${globalCss}`;

// While waiting, here is some basic duplication of the base style
const innerFragmentStyle = {
  fontFamily: 'visuelt',
};

type Props = {
  name: string;
  tenantId: string;
  children?: JSX.Element | null;
};

type State = {
  fragmentHtml?: string | null;
};

class Fragment extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      fragmentHtml: undefined,
    };
  }

  componentDidMount() {
    fetch(this.fragmentUrl())
      .then((response) => {
        if (response.ok) {
          return response.text();
        } else {
          throw('not found');
        }
      })
      .then((fragmentHtml) => {
        this.setState({ fragmentHtml });
      })
      .catch(() => {
        this.setState({ fragmentHtml: null });
      });
  }

  fragmentUrl = () => `/fragments/${this.props.tenantId}/${this.props.name}.html`;

  render() {
    const { children } = this.props;
    const { fragmentHtml } = this.state;

    if (fragmentHtml) {
      return (
        <StyledFrame>
          <div style={innerFragmentStyle}>
            <div dangerouslySetInnerHTML={{ __html: fragmentHtml }} />
          </div>
        </StyledFrame>
      );
    } else if (fragmentHtml === null) {
      return children;
    } else return null;
  }
}


export default (inputProps) => (
  <GetTenant>
    {(tenant) => tenant ? <Fragment {...inputProps} tenantId={tenant.id} /> : null}
  </GetTenant>
);
