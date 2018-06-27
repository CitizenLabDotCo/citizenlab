import React, { PureComponent } from 'react';
import { isNil } from 'lodash';
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

  ${props => !isNil((props as any).selectionIndex) && `
    stroke: black;
    stroke-width: 2px;
    fill: ${props.theme.comparisonColors[(props as any).selectionIndex]};
  `}
`;

const StyledText: any = styled.text`
  font-size: ${props => (props as any).size}px;
`;

interface InputProps {
  node: D3Node;
  selectionIndex: number | null;
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
    const { node, selectionIndex, hovered } = this.props;
    return (
      <>
        <StyledCircle
          r={node.r}
          onClick={this.handleOnClick}
          onMouseEnter={this.handleOnMouseEnter}
          onMouseLeave={this.handleOnMouseLeave}
          selectionIndex={selectionIndex}
        />
        <StyledText
          x={0}
          y={-node.r}
          textAnchor="middle"
          alignmentBaseline="central"
          show={!isNil(selectionIndex) || hovered}
          size={12 + (2 * node.height)}
        >
          {node.data['title']}
        </StyledText>
      </>
    );
  }
}

export default ClusterCircle;
