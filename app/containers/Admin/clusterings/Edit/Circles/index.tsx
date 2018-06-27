import React, { PureComponent } from 'react';
import * as d3Hierarchy from 'd3-hierarchy';
import { keyBy, find } from 'lodash';
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
  selectedNodes: Node[];
  onClickNode: (Node) => void;
  onShiftClickNode: (Node) => void;
}

interface DataProps {
  ideas: GetIdeasChildProps;
}

interface Props extends InputProps, DataProps {}

type State = {
  svgSize: number | null;
  nodes: D3Node[];
  hoveredNode: D3Node | null;
  selectedNode: D3Node | null;
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
      selectedNode: null,
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
        selectedNode: rootNode
      });
    }
  }

  setContainerRef = (ref: HTMLDivElement) => {
    this.containerRef = ref;
  }

  handleOnClickNode = (node: D3Node, event: MouseEvent) => {
    console.log(node);
    console.log(event);

    if (event.shiftKey) {
      this.props.onShiftClickNode(node.data);
    } else {
      this.props.onClickNode(node.data);
    }
  }

  handleOnMouseEnterIdea = (node: D3Node, event: MouseEvent) => () => {
    this.setState({
      hoveredNode: node
    });
  }

  handleOnMouseLeaveIdea = (node: D3Node, event: MouseEvent) => {
    this.setState({
      hoveredNode: null
    });
  }

  isSelected = (node: D3Node) => {
    return !!find(this.props.selectedNodes, { id: node.data.id });
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
                    onClick={this.handleOnClickNode}
                    onMouseEnter={this.handleOnMouseEnterIdea}
                    onMouseLeave={this.handleOnMouseLeaveIdea}
                    selected={this.isSelected(node)}
                    hovered={node === this.state.hoveredNode}
                  />
                }
                {node.data.type === 'custom' &&
                  <CustomCircle
                    node={node}
                    onClick={this.handleOnClickNode}
                    selected={this.isSelected(node)}
                  />
                }
                {node.data.type === 'project' &&
                  <ProjectCircle
                    node={node}
                    projectId={node.data.id}
                    onClick={this.handleOnClickNode}
                    selected={this.isSelected(node)}
                  />
                }
                {node.data.type === 'topic' &&
                  <TopicCircle
                    node={node}
                    topicId={node.data.id}
                    onClick={this.handleOnClickNode}
                    selected={this.isSelected(node)}
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
