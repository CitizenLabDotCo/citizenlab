import React, { PureComponent } from 'react';
import * as d3Hierarchy from 'd3-hierarchy';
import { keyBy, find, findIndex } from 'lodash';
import IdeaCircle from './IdeaCircle';
import CustomCircle from './CustomCircle';
import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';
import { Node, ParentNode } from 'services/clusterings';
import ProjectCircle from './ProjectCircle';
import TopicCircle from './TopicCircle';
import styled from 'styled-components';

export type D3Node = {
  data: Node;
  [key: string]: any;
};

interface InputProps {
  structure: ParentNode;
  selectedNodes: Node[][];
  activeComparison: number;
  onClickNode: (Node) => void;
  onShiftClickNode: (Node) => void;
  onCtrlCickNode: (Node) => void;
}

interface DataProps {
  ideas: GetIdeasChildProps;
}

interface Props extends InputProps, DataProps {}

type State = {
  svgSize: number | null;
  nodes: D3Node[];
  hoveredNode: D3Node | null;
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

class Circles extends PureComponent<Props, State> {
  containerRef: HTMLDivElement | null;

  constructor(props: Props) {
    super(props);
    this.state = {
      svgSize: null,
      nodes: [],
      hoveredNode: null,
    };
    this.containerRef = null;
  }

  componentDidMount() {
    window.addEventListener('resize', this.calculateNodePositions);
    this.calculateNodePositions();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.calculateNodePositions);
  }

  calculateNodePositions = () => {
    if (this.containerRef) {
      const ideasById = keyBy(this.props.ideas.ideasList, 'id');
      const rootNode = d3Hierarchy.hierarchy(this.props.structure).sum((d) => ideasById[d.id] ? (ideasById[d.id].attributes.upvotes_count + ideasById[d.id].attributes.downvotes_count + 1) : 1);
      const svgWidth = this.containerRef.offsetWidth;
      const svgHeight = this.containerRef.offsetHeight;
      const svgSize = (svgWidth >= svgHeight ? svgHeight : svgWidth) - 30;
      const pack = d3Hierarchy.pack().size([svgSize, svgSize]).padding(10);

      pack(rootNode);

      this.setState({
        svgSize,
        nodes: rootNode.descendants(),
      });
    }
  }

  comparisonSet = () => {
    return this.props.selectedNodes[this.props.activeComparison];
  }

  setContainerRef = (ref: HTMLDivElement) => {
    this.containerRef = ref;
  }

  handleOnClickNode = (node: D3Node, event: MouseEvent) => {
    if (event.shiftKey) {
      this.props.onShiftClickNode(node.data);
    } else if (event.ctrlKey) {
      this.props.onCtrlCickNode(node.data);
    } else {
      this.props.onClickNode(node.data);
    }
  }

  handleOnMouseEnter = (hoveredNode: D3Node, _event: MouseEvent) => {
    this.setState({ hoveredNode });
  }

  handleOnMouseLeave = (_node: D3Node, _event: MouseEvent) => {
    this.setState({ hoveredNode: null });
  }

  selectionIndex = (node: D3Node) => {
    const index = findIndex(this.props.selectedNodes, (nodes) => (
      !!find(nodes, { id: node.data.id })
    ));
    return index === -1 ? null : index;
  }

  render() {
    const { nodes, svgSize } = this.state;

    return (
      <Container innerRef={this.setContainerRef} className={this.props['className']}>
        {svgSize &&
          <svg
            width={svgSize}
            height={svgSize}
            preserveAspectRatio="xMidYMid meet"
            style={{ overflow: 'visible' }}
          >
            {nodes.map((node, index) => (
              <g
                key={index}
                transform={`translate(${node.x},${node.y})`}
              >
                {node.data.type === 'idea' &&
                  <IdeaCircle
                    node={node}
                    ideaId={node.data.id}
                    hovered={node === this.state.hoveredNode}
                    selectionIndex={this.selectionIndex(node)}
                    onClick={this.handleOnClickNode}
                    onMouseEnter={this.handleOnMouseEnter}
                    onMouseLeave={this.handleOnMouseLeave}
                  />
                }
                {node.data.type === 'custom' &&
                  <CustomCircle
                    node={node}
                    onClick={this.handleOnClickNode}
                    selectionIndex={this.selectionIndex(node)}
                  />
                }
                {node.data.type === 'project' &&
                  <ProjectCircle
                    node={node}
                    projectId={node.data.id}
                    hovered={node === this.state.hoveredNode}
                    selectionIndex={this.selectionIndex(node)}
                    onClick={this.handleOnClickNode}
                    onMouseEnter={this.handleOnMouseEnter}
                    onMouseLeave={this.handleOnMouseLeave}
                  />
                }
                {node.data.type === 'topic' &&
                  <TopicCircle
                    node={node}
                    topicId={node.data.id}
                    hovered={node === this.state.hoveredNode}
                    selectionIndex={this.selectionIndex(node)}
                    onClick={this.handleOnClickNode}
                    onMouseEnter={this.handleOnMouseEnter}
                    onMouseLeave={this.handleOnMouseLeave}
                  />
                }
              </g>
            ))}
          </svg>
        }
      </Container>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetIdeas type="load-more" pageSize={1000} sort="new">
    {(ideasProps) => ideasProps.ideasList ? <Circles {...inputProps} ideas={ideasProps} /> : null}
  </GetIdeas>
);
