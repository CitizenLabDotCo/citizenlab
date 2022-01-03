import React, { PureComponent } from 'react';
import { hierarchy, pack } from 'd3-hierarchy';
import { keyBy, find, findIndex } from 'lodash-es';
import styled from 'styled-components';

import { Icon } from '@citizenlab/cl2-component-library';
import IdeaCircle from './IdeaCircle';
import IdeaCircleLabel from './IdeaCircleLabel';
import CustomCircle from './CustomCircle';
import CustomCircleLabel from './CustomCircleLabel';
import ProjectCircle from './ProjectCircle';
import ProjectCircleLabel from './ProjectCircleLabel';
import TopicCircle from './TopicCircle';
import TopicCircleLabel from './TopicCircleLabel';
import LegendPanel from './LegendPanel';

import GetIdeas, { GetIdeasChildProps } from 'resources/GetIdeas';
import { Node, ParentNode, CustomNode } from '../../../../services/clusterings';

export type D3Node<N = Node> = {
  data: N;
  [key: string]: any;
};

interface InputProps {
  structure: ParentNode;
  selectedNodes: Node[][];
  activeComparison: number;
  onClickNode: (Node) => void;
  onShiftClickNode: (Node) => void;
  onCtrlClickNode: (Node) => void;
}

interface DataProps {
  ideas: GetIdeasChildProps;
}

interface Props extends InputProps, DataProps {}

type State = {
  svgSize: number | null;
  nodes: D3Node[];
  hoveredNode: D3Node | null;
  ctrlKeyPressed: boolean;
  showLegend: boolean;
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const LegendCorner = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
`;
const StyledIcon = styled(Icon)`
  width: 30px;
  height: 30px;
`;

class Circles extends PureComponent<Props, State> {
  containerRef: HTMLDivElement | null;

  constructor(props: Props) {
    super(props);
    this.state = {
      svgSize: null,
      nodes: [],
      hoveredNode: null,
      ctrlKeyPressed: false,
      showLegend: false,
    };
    this.containerRef = null;
  }

  componentDidMount() {
    window.addEventListener('resize', this.calculateNodePositions);
    window.addEventListener('keydown', this.handleOnKeyDown);
    window.addEventListener('keyup', this.handleOnKeyUp);
    window.addEventListener('contextmenu', this.handleContextMenu);
    this.calculateNodePositions();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.calculateNodePositions);
    window.removeEventListener('keydown', this.handleOnKeyDown);
    window.removeEventListener('keyup', this.handleOnKeyUp);
    window.removeEventListener('contextmenu', this.handleContextMenu);
  }

  calculateNodePositions = () => {
    if (this.containerRef) {
      const ideasById = keyBy(this.props.ideas.list, 'id');
      const rootNode = hierarchy(this.props.structure).sum((d) =>
        ideasById[d.id]
          ? ideasById[d.id].attributes.upvotes_count +
            ideasById[d.id].attributes.downvotes_count +
            1
          : 1
      );
      const svgWidth = this.containerRef.offsetWidth;
      const svgHeight = this.containerRef.offsetHeight;
      const svgSize = (svgWidth >= svgHeight ? svgHeight : svgWidth) - 30;
      const packFn = pack().size([svgSize, svgSize]).padding(10);

      packFn(rootNode);

      this.setState({
        svgSize,
        nodes: rootNode.descendants(),
      });
    }
  };

  comparisonSet = () => {
    return this.props.selectedNodes[this.props.activeComparison];
  };

  setContainerRef = (ref: HTMLDivElement) => {
    this.containerRef = ref;
  };

  handleOnClickNode = (node: D3Node, event: MouseEvent) => {
    if (event.shiftKey) {
      this.props.onShiftClickNode(node.data);
    } else if (this.state.ctrlKeyPressed) {
      this.props.onCtrlClickNode(node.data);
    } else {
      this.props.onClickNode(node.data);
    }
  };

  handleContextMenu = (event: Event) => {
    event.preventDefault();

    this.setState({ ctrlKeyPressed: true });

    if (this.state.hoveredNode) {
      this.props.onCtrlClickNode(this.state.hoveredNode.data);
    }
  };

  handleOnKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Control') {
      this.setState({ ctrlKeyPressed: true });
    }
  };

  handleOnKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Control') {
      this.setState({ ctrlKeyPressed: false });
    }
  };

  handleOnMouseEnter = (hoveredNode: D3Node, _event: MouseEvent) => {
    this.setState({ hoveredNode });
  };

  handleOnMouseLeave = (_node: D3Node, _event: MouseEvent) => {
    this.setState({ hoveredNode: null });
  };

  selectionIndex = (node: D3Node) => {
    const index = findIndex(
      this.props.selectedNodes,
      (nodes) => !!find(nodes, { id: node.data.id })
    );
    return index === -1 ? null : index;
  };

  onShowLegend = () => {
    this.setState({ showLegend: true });
  };
  onHideLegend = () => {
    this.setState({ showLegend: false });
  };

  render() {
    const { nodes, svgSize, hoveredNode, showLegend } = this.state;

    const CirclesElements: any = [];
    const HoverLabelElements: any = [];
    const CustomLabelElements: any = [];
    nodes.map((node, index) => {
      if (node.data.type === 'idea') {
        CirclesElements.push(
          <IdeaCircle
            key={index}
            node={node}
            ideaId={node.data.id}
            hovered={node === hoveredNode}
            selectionIndex={this.selectionIndex(node)}
            onClick={this.handleOnClickNode}
            onMouseEnter={this.handleOnMouseEnter}
            onMouseLeave={this.handleOnMouseLeave}
          />
        );
        HoverLabelElements.push(
          <IdeaCircleLabel
            key={index}
            node={node}
            ideaId={node.data.id}
            hovered={node === hoveredNode}
            selectionIndex={this.selectionIndex(node)}
            onClick={this.handleOnClickNode}
            onMouseEnter={this.handleOnMouseEnter}
            onMouseLeave={this.handleOnMouseLeave}
          />
        );
      }
      if (node.data.type === 'custom') {
        CirclesElements.push(
          <CustomCircle
            key={index}
            node={node as D3Node<CustomNode>}
            onClick={this.handleOnClickNode}
            selectionIndex={this.selectionIndex(node)}
            onMouseEnter={this.handleOnMouseEnter}
            onMouseLeave={this.handleOnMouseLeave}
          />
        );
        CustomLabelElements.push(
          <CustomCircleLabel
            key={index}
            node={node as D3Node<CustomNode>}
            onClick={this.handleOnClickNode}
            selectionIndex={this.selectionIndex(node)}
            onMouseEnter={this.handleOnMouseEnter}
            onMouseLeave={this.handleOnMouseLeave}
          />
        );
      }
      if (node.data.type === 'project') {
        CirclesElements.push(
          <ProjectCircle
            key={index}
            node={node}
            projectId={node.data.id}
            hovered={node === hoveredNode}
            selectionIndex={this.selectionIndex(node)}
            onClick={this.handleOnClickNode}
            onMouseEnter={this.handleOnMouseEnter}
            onMouseLeave={this.handleOnMouseLeave}
          />
        );
        HoverLabelElements.push(
          <ProjectCircleLabel
            key={index}
            node={node}
            projectId={node.data.id}
            hovered={node === hoveredNode}
            selectionIndex={this.selectionIndex(node)}
            onClick={this.handleOnClickNode}
            onMouseEnter={this.handleOnMouseEnter}
            onMouseLeave={this.handleOnMouseLeave}
          />
        );
      }
      if (node.data.type === 'topic') {
        CirclesElements.push(
          <TopicCircle
            key={index}
            node={node}
            topicId={node.data.id}
            hovered={node === hoveredNode}
            selectionIndex={this.selectionIndex(node)}
            onClick={this.handleOnClickNode}
            onMouseEnter={this.handleOnMouseEnter}
            onMouseLeave={this.handleOnMouseLeave}
          />
        );
        HoverLabelElements.push(
          <TopicCircleLabel
            key={index}
            node={node}
            topicId={node.data.id}
            hovered={node === hoveredNode}
            selectionIndex={this.selectionIndex(node)}
            onClick={this.handleOnClickNode}
            onMouseEnter={this.handleOnMouseEnter}
            onMouseLeave={this.handleOnMouseLeave}
          />
        );
      }
    });
    return (
      <Container ref={this.setContainerRef} className={this.props['className']}>
        {svgSize && (
          <svg
            width={svgSize}
            height={svgSize}
            preserveAspectRatio="xMidYMid meet"
            style={{ overflow: 'visible' }}
          >
            <g className="circles">{CirclesElements}</g>
            <g className="labels">
              {CustomLabelElements}
              {HoverLabelElements}
            </g>
          </svg>
        )}
        <LegendCorner>
          {!showLegend ? (
            <button onClick={this.onShowLegend}>
              <StyledIcon name="info" />
            </button>
          ) : (
            <LegendPanel onClickOutside={this.onHideLegend} />
          )}
        </LegendCorner>
      </Container>
    );
  }
}
export default (inputProps: InputProps) => (
  <GetIdeas type="load-more" pageSize={1000} sort="new">
    {(ideasProps) =>
      ideasProps.list ? <Circles {...inputProps} ideas={ideasProps} /> : null
    }
  </GetIdeas>
);
