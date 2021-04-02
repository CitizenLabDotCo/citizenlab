import React, { PureComponent } from 'react';
import { isNil } from 'lodash-es';
import styled from 'styled-components';
import { D3Node } from './';
import { CustomNode } from '../../../../services/clusterings';

const StyledCircle: any = styled.circle`
  position: relative;
  fill: green;
  fill-opacity: 0.2;
  cursor: pointer;

  ${(props) =>
    !isNil((props as any).selectionIndex) &&
    `
    stroke: black;
    stroke-width: 2px;
    fill: ${props.theme.comparisonColors[(props as any).selectionIndex]};
  `}
`;

interface InputProps {
  node: D3Node<CustomNode>;
  selectionIndex: number | null;
  hovered?: boolean;
  onClick?: (node: D3Node<CustomNode>, event: MouseEvent) => void;
  onMouseEnter?: (node: D3Node<CustomNode>, event: MouseEvent) => void;
  onMouseLeave?: (node: D3Node<CustomNode>, event: MouseEvent) => void;
}

interface DataProps {}

interface Props extends InputProps, DataProps {}

interface State {}

class ClusterCircle extends PureComponent<Props, State> {
  handleOnClick = (event: MouseEvent) => {
    const { node } = this.props;
    this.props.onClick && this.props.onClick(node, event);
  };

  handleOnMouseEnter = (event: MouseEvent) => {
    const { node } = this.props;
    this.props.onMouseEnter && this.props.onMouseEnter(node, event);
  };

  handleOnMouseLeave = (event: MouseEvent) => {
    const { node } = this.props;
    this.props.onMouseLeave && this.props.onMouseLeave(node, event);
  };

  render() {
    const { node, selectionIndex } = this.props;

    return (
      <StyledCircle
        transform={`translate(${node.x},${node.y})`}
        r={node.r}
        onClick={this.handleOnClick}
        onMouseEnter={this.handleOnMouseEnter}
        onMouseLeave={this.handleOnMouseLeave}
        selectionIndex={selectionIndex}
      />
    );
  }
}

export default ClusterCircle;
