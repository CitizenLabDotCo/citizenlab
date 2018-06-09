import React, { Component } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3-hierarchy';
import keyBy from 'lodash/keyBy';
import flatten from 'lodash/flatten';
import IdeaCircle from './IdeaCircle';
import ClusterCircle from './ClusterCircle';
import IdeaDetails from './IdeaDetails';
import ClusterDetails from './ClusterDetails';
import GenderChart from './GenderChart';
// import AgeChart from './AgeChart';
import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';

const TwoColumns = styled.div`
  display: flex;
`;

type Props = {
  ideas: GetIdeasChildProps;
  clusters: any;
};

type State = {
  nodes: any[];
  ideasById: any;
  selectedItem: string | object | null;
  hoveredItem: string | object | null;
};

class Browser extends Component<Props, State> {

  svgRef: SVGElement | null;

  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
      ideasById: {},
      selectedItem: null,
      hoveredItem: null,
    };
  }

  componentDidMount() {
    const svgRef: any = this.svgRef;
    const ideasById: any = keyBy(this.props.ideas.ideasList, 'id');
    const root = d3.hierarchy(this.props.clusters)
      .sum((d) => ideasById[d.id] ? (ideasById[d.id].attributes.upvotes_count + ideasById[d.id].attributes.downvotes_count) : 1);

    const pack = d3.pack()
      .size([svgRef.width.baseVal.value - 2, svgRef.height.baseVal.value - 2])
      .padding(10);
    pack(root);

    this.setState({
      ideasById,
      nodes: root.descendants(),
    });
  }

  isCluster = (node) => {
    return node && node.height;
  }

  isIdea = (node) => {
    return typeof node === 'string';
  }

  setSVGRef = (r) => {
    this.svgRef = r;
  }

  handleOnSelectIdea = (node) => () => {
    this.setState({
      selectedItem: node.data.id,
    });
  }

  handleOnMouseEnterIdea = (node) => () => {
    this.setState({ hoveredItem: node.data.id });
  }

  handleOnMouseLeaveIdea = () => () => {
    this.setState({ hoveredItem: null });
  }

  handleOnSelectCluster = (node) => () => {
    this.setState({ selectedItem: node });
  }

  clusterIdeas = (node) => {
    if (node.height === 0) {
      return node.data.id;
    } else {
      return flatten(node.children.map((c) => this.clusterIdeas(c)));
    }
  }

  selectedIdeas = () => {
    const { selectedItem } = this.state;
    if (this.isIdea(selectedItem)) {
      return [selectedItem];
    } else if (this.isCluster(selectedItem)) {
      return this.clusterIdeas(selectedItem);
    } else {
      return [];
    }
  }

  render() {
    const { nodes, selectedItem } = this.state;
    return (
      <div>
        <TwoColumns>
          <div>
            <svg ref={this.setSVGRef} width={800} height={800}>
              {nodes.map((node, index) => (
                <g
                  key={index}
                  transform={`translate(${node.x},${node.y})`}
                >
                  {node.height === 0 ?
                    <IdeaCircle
                      node={node}
                      ideaId={node.data.id}
                      onClick={this.handleOnSelectIdea(node)}
                      onMouseEnter={this.handleOnMouseEnterIdea(node)}
                      onMouseLeave={this.handleOnMouseLeaveIdea()}
                      selected={node.data.id === this.state.selectedItem}
                      hovered={node.data.id === this.state.hoveredItem}
                    />
                  :
                    <ClusterCircle
                      node={node}
                      onClick={this.handleOnSelectCluster(node)}
                      selected={node === selectedItem}
                    />
                  }
                </g>
              ))}
            </svg>
          </div>
          <div>
            <GenderChart ideaIds={this.selectedIdeas()} />
            {/* <AgeChart ideaIds={this.selectedIdeas()} /> */}
            {this.isIdea(selectedItem) && <IdeaDetails ideaId={selectedItem} />}
            {this.isCluster(selectedItem) && <ClusterDetails node={selectedItem} ideaIds={this.clusterIdeas(selectedItem)} />}
          </div>
        </TwoColumns>
      </div>
    );
  }
}


export default (inputProps) => (
  <GetIdeas type="load-more" pageSize={250} sort="new">
    {(ideasProps) => ideasProps.ideasList ? <Browser {...inputProps} ideas={ideasProps} /> : null}
  </GetIdeas>
);
