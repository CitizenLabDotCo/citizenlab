import * as React from 'react';
import styled from 'styled-components';

const StyledIframe = styled.iframe``;

type Props = {
  path: string;
  width: number;
  height: number;
  className?: string;
};

interface State {}

class WidgetPreview extends React.Component<Props, State> {
  render() {
    const { path, width, height, className } = this.props;
    return (
      <StyledIframe
        className={className}
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
