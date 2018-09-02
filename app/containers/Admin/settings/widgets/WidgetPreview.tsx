import * as React from 'react';
import styled from 'styled-components';

const StyledIframe = styled.iframe`
  border-radius: 5px;
  border: solid 1px #ddd;
`;

type Props = {
  path: string;
  width: number;
  height: number;
};

type State = {};

class WidgetPreview extends React.Component<Props, State> {

  render() {
    const { path, width, height } = this.props;
    return (
      <StyledIframe
        frameBorder={0}
        scrolling="no"
        src={`/widgets${path}`}
        width={width}
        height={height}
      />
    );
  }
}

export default WidgetPreview;
