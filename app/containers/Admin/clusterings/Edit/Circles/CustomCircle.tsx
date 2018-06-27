import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { D3Node } from './';

const StyledCircle: any = styled.circle`
  position: relative;
  fill: green;
  fill-opacity: 0.2;
  cursor: pointer;

  &:hover {
    stroke: blue;
    stroke-width: 2px;
  }

  ${props => (props as any).selected && `
    stroke: black;
    stroke-width: 2px;
    fill: ${props.theme.selectionColor};
  `}
`;

const StyledText: any = styled.text`
  font-size: ${props => (props as any).size}px;
`;

interface InputProps {
  node: D3Node;
  selected: boolean;
  hovered?: boolean;
  onClick?: (node: D3Node, event: MouseEvent) => void;
  onMouseEnter?: (node: D3Node, event: MouseEvent) => void;
  onMouseLeave?: (node: D3Node, event: MouseEvent) => void;
}

interface DataProps {}

interface Props extends InputProps, DataProps {}

interface State {}

class ClusterCircle extends PureComponent<Props, State> {

  handleOnClick = (event: MouseEvent) => {
    const { node } = this.props;
    this.props.onClick && this.props.onClick(node, event);
  }

  handleOnMouseEnter = (event: MouseEvent) => {
    const { node } = this.props;
    this.props.onMouseEnter && this.props.onMouseEnter(node, event);
  }

  handleOnMouseLeave = (event: MouseEvent) => {
    const { node } = this.props;
    this.props.onMouseLeave && this.props.onMouseLeave(node, event);
  }

  render() {
    const { node, selected, hovered } = this.props;
    return (
      <>
        <StyledCircle
          r={node.r}
          onClick={this.handleOnClick}
          onMouseEnter={this.handleOnMouseEnter}
          onMouseLeave={this.handleOnMouseLeave}
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
          {node.data['title']}
        </StyledText>
      </>
    );
  }
}

export default ClusterCircle;
