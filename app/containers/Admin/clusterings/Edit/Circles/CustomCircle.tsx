import React, { PureComponent } from 'react';
import styled from 'styled-components';

const StyledCircle: any = styled.circle`
  fill: green;
  opacity: 0.2;

  &:hover {
    stroke: grey;
    stroke-width: 3px;
  }
  ${props => (props as any).selected && `
    stroke: black;
    stroke-width: 3px;
    fill: ${props.theme.selectionColor};
    opacity: 0.4;
  `}
`;

const StyledText: any = styled.text`
  font-size: ${props => (props as any).size}px;
`;

type Props = {
  node: any;
  selected: boolean;
  hovered?: boolean;
  onClick?: (any) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

class ClusterCircle extends PureComponent<Props> {

  render() {
    const { node, selected, hovered } = this.props;
    return (
      <>
        <StyledCircle
          r={node.r}
          onClick={this.props.onClick}
          onMouseEnter={this.props.onMouseEnter}
          onMouseLeave={this.props.onMouseLeave}
          selected={selected}
        />
        <StyledText
          x={0}
          y={-node.r}
          textAnchor="middle"
          alignmentBaseline="central"
          show={selected || hovered}
          size={12 + (2 * node.height)}
        >
          {node.data.title}
        </StyledText>
      </>
    );
  }
}

export default ClusterCircle;
