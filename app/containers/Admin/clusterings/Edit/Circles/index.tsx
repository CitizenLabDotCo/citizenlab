import React, { PureComponent } from 'react';
import * as d3 from 'd3';
import * as d3Hierarchy from 'd3-hierarchy';
import { keyBy, find, get } from 'lodash';
import IdeaCircle from './IdeaCircle';
import CustomCircle from './CustomCircle';
import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';
import { Node, ParentNode } from 'services/clusterings';
import ProjectCircle from './ProjectCircle';
import TopicCircle from './TopicCircle';
import styled from 'styled-components';

type D3Node = {
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
  rootNode: D3Node | null;
  selectedNode: D3Node | null;
  hoveredIdea: string | null;
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

class Circles extends PureComponent<Props, State> {
  svgContainerRef: HTMLDivElement | null;

  constructor(props: Props) {
    super(props);
    this.state = {
      svgSize: null,
      nodes: [],
      rootNode: null,
      selectedNode: null,
      hoveredIdea: null,
    };
    this.svgContainerRef = null;
  }

  componentDidMount() {
    window.addEventListener('resize', this.calculateNodePositions);
    this.calculateNodePositions();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.calculateNodePositions);
  }

  calculateNodePositions = () => {
    if (this.svgContainerRef) {
      const ideasById = keyBy(this.props.ideas.ideasList, 'id');
      const rootNode = d3Hierarchy.hierarchy(this.props.structure).sum((d) => ideasById[d.id] ? (ideasById[d.id].attributes.upvotes_count + ideasById[d.id].attributes.downvotes_count + 1) : 1);
      const svgWidth = this.svgContainerRef.offsetWidth;
      const svgHeight = this.svgContainerRef.offsetHeight;
      const svgSize = (svgWidth >= svgHeight ? svgHeight : svgWidth) - 30;
      const pack = d3Hierarchy.pack().size([svgSize, svgSize]).padding(10);

      pack(rootNode);

      console.log(d3);

      this.setState({
        svgSize,
        rootNode,
        nodes: rootNode.descendants(),
        selectedNode: rootNode
      });
    }
  }

  setSVGContainerRef = (ref: HTMLDivElement) => {
    this.svgContainerRef = ref;
  }

  zoom = (selectedNode: D3Node) => {
    d3.transition()
      .duration(get(d3.event, 'altKey') ? 5000 : 500)
      .tween('zoom', () => {
        const margin = 20;
        const i = d3.interpolateZoom([0, 0, 0], [selectedNode.x, selectedNode.y, selectedNode.r * 2 + margin]);

        return (t) => {
          this.zoomTo(i(t));
        };
      });
  }

  zoomTo = (view: [number, number, number]) => {
    const { rootNode } = this.state;
    const diameter = (this.svgContainerRef ? this.svgContainerRef.offsetWidth : 0);
    const k = diameter / view[2];

    if (rootNode) {
      rootNode.attr('transform', (d: D3Node) => {
        return 'translate(' + (d.x - view[0]) * k + ',' + (d.y - view[1]) * k + ')';
      });
    }

    // circle.attr('r', (d: any) => {
    //   return d.r * k;
    // });
  }

  handleOnClickNode = (node: D3Node) => (event: MouseEvent) => {
    if (event.shiftKey) {
      this.props.onShiftClickNode(node.data);
    } else {
      this.zoom(node);
      this.props.onClickNode(node.data);
      d3.event.stopPropagation();
    }
  }

  handleOnMouseEnterIdea = (node: D3Node) => () => {
    this.setState({ hoveredIdea: node.data.id });
  }

  handleOnMouseLeaveIdea = () => () => {
    this.setState({ hoveredIdea: null });
  }

  isSelected = (node: D3Node) => {
    return !!find(this.props.selectedNodes, { id: node.data.id });
  }

  render() {
    const { nodes, svgSize } = this.state;

    return (
      <Container innerRef={this.setSVGContainerRef} className={this.props['className']}>
        {svgSize &&
          <svg width={svgSize} height={svgSize} preserveAspectRatio="xMidYMid meet">
            {nodes.map((node, index) => (
              <g
                key={index}
                transform={`translate(${node.x},${node.y})`}
              >
                {node.data.type === 'idea' &&
                  <IdeaCircle
                    node={node}
                    ideaId={node.data.id}
                    onClick={this.handleOnClickNode(node)}
                    onMouseEnter={this.handleOnMouseEnterIdea(node)}
                    onMouseLeave={this.handleOnMouseLeaveIdea()}
                    selected={this.isSelected(node)}
                    hovered={node.data.id === this.state.hoveredIdea}
                  />
                }
                {node.data.type === 'custom' &&
                  <CustomCircle
                    node={node}
                    onClick={this.handleOnClickNode(node)}
                    selected={this.isSelected(node)}
                  />
                }
                {node.data.type === 'project' &&
                  <ProjectCircle
                    node={node}
                    projectId={node.data.id}
                    onClick={this.handleOnClickNode(node)}
                    selected={this.isSelected(node)}
                  />
                }
                {node.data.type === 'topic' &&
                  <TopicCircle
                    node={node}
                    topicId={node.data.id}
                    onClick={this.handleOnClickNode(node)}
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
  <GetIdeas type="load-more" pageSize={250} sort="new">
    {(ideasProps) => ideasProps.ideasList ? <Circles {...inputProps} ideas={ideasProps} /> : null}
  </GetIdeas>
);
