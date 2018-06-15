import React, { Component } from 'react';
import * as d3 from 'd3-hierarchy';
import { keyBy, find } from 'lodash';
import IdeaCircle from './IdeaCircle';
import CustomCircle from './CustomCircle';
import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';
import { Node } from 'services/clusterings';
import ProjectCircle from './ProjectCircle';
import TopicCircle from './TopicCircle';
import styled from 'styled-components';

type D3Node = {
  data: Node;
  [key: string]: any;
};

type Props = {
  ideas: GetIdeasChildProps;
  structure: ParentNode;
  selectedNodes: Node[];
  onClickNode: (Node) => void;
  onShiftClickNode: (Node) => void;
  className?: string;
};

type State = {
  nodes: D3Node[];
  hoveredIdea: string | null;
  svgSize?: number;
};

const Container = styled.div`
  max-width: 1200px;
  display: flex;
  align-items: stretch;
  padding: 0;
  margin: 0;
`;

const StyledSvg = styled.svg`
  width: 100%;
`;

class Circles extends Component<Props, State> {
  svgContainerRef: SVGElement | null;

  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
      hoveredIdea: null,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.calculateNodePositions);
    this.calculateNodePositions();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.calculateNodePositions);
  }

  calculateNodePositions = () => {
    const svgContainerRef: any = this.svgContainerRef;
    const ideasById: any = keyBy(this.props.ideas.ideasList, 'id');
    const root = d3.hierarchy(this.props.structure)
    .sum((d) => ideasById[d.id] ? (ideasById[d.id].attributes.upvotes_count + ideasById[d.id].attributes.downvotes_count + 1) : 1);

    const svgSize = svgContainerRef.offsetWidth;

    const pack = d3.pack()
      .size([svgSize, svgSize])
      .padding(10);

    pack(root);

    this.setState({
      svgSize,
      nodes: root.descendants(),
    });
  }

  setSVGContainerRef = (r) => {
    this.svgContainerRef = r;
  }

  handleOnClickNode = (node) => (event) => {
    if (event.shiftKey) {
      this.props.onShiftClickNode(node.data);
    } else {
      this.props.onClickNode(node.data);
    }
  }

  handleOnMouseEnterIdea = (node) => () => {
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
      <Container innerRef={this.setSVGContainerRef}>
        {svgSize &&
          <StyledSvg width={svgSize} height={svgSize}>
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
          </StyledSvg>
        }
      </Container>
    );
  }
}

export default (inputProps) => (
  <GetIdeas type="load-more" pageSize={250} sort="new">
    {(ideasProps) => ideasProps.ideasList ? <Circles {...inputProps} ideas={ideasProps} /> : null}
  </GetIdeas>
);
