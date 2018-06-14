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
// import styled from 'styled-components';

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
};

// const Container = styled.div``;

const StyledSvg = styled.svg`
  width: 100%;
`;

class Circles extends Component<Props, State> {
  svgRef: SVGElement | null;

  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
      hoveredIdea: null,
    };
  }

  componentDidMount() {
    // const svgRef: any = this.svgRef;
    const ideasById: any = keyBy(this.props.ideas.ideasList, 'id');
    const root = d3.hierarchy(this.props.structure)
      .sum((d) => ideasById[d.id] ? (ideasById[d.id].attributes.upvotes_count + ideasById[d.id].attributes.downvotes_count + 1) : 1);

    const pack = d3.pack()
      // .size([svgRef.width.baseVal.value - 2, svgRef.height.baseVal.value - 2])
      .size([750, 750])
      .padding(10);
    pack(root);

    this.setState({
      nodes: root.descendants(),
    });
  }

  setSVGRef = (r) => {
    this.svgRef = r;
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
    const { nodes } = this.state;

    return (
      <div className={this.props.className}>
        <StyledSvg innerRef={this.setSVGRef} viewBox="0 0 750 750">
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
      </div>
    );
  }
}

export default (inputProps) => (
  <GetIdeas type="load-more" pageSize={250} sort="new">
    {(ideasProps) => ideasProps.ideasList ? <Circles {...inputProps} ideas={ideasProps} /> : null}
  </GetIdeas>
);
