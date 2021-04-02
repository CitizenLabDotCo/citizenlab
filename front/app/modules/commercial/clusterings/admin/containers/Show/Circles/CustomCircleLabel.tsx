import React, { PureComponent } from 'react';
import { isNil, take } from 'lodash-es';
import styled from 'styled-components';
import { D3Node } from './';
import { CustomNode } from '../../../../services/clusterings';

const StyledText: any = styled.text`
  font-size: ${(props) => (props as any).size}px;
  text-shadow: white 0px 0px 10px;
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

class ClusterCircleLabel extends PureComponent<Props, State> {
  nodeLabel = () => {
    const nodeData = this.props.node.data;
    return (
      nodeData.title ||
      (nodeData.keywords &&
        take(
          nodeData.keywords.map((k) => k.name),
          1
        ).join(' '))
    );
  };

  render() {
    const { node, selectionIndex, hovered } = this.props;

    return (
      <StyledText
        transform={`translate(${node.x},${node.y - node.r})`}
        textAnchor="middle"
        alignmentBaseline="central"
        show={!isNil(selectionIndex) || hovered}
        size={12 + 2 * node.height}
      >
        {this.nodeLabel()}
      </StyledText>
    );
  }
}

export default ClusterCircleLabel;
