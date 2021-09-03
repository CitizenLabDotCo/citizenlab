// libraries
import React, { PureComponent } from 'react';
import { clone } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// components
import Circles from './Circles';
import InfoPane from './InfoPane';
import GoBackButton from 'components/UI/GoBackButton';
import { PageTitle } from 'components/admin/Section';
import T from 'components/T';

// typings
import { Node } from '../../../services/clusterings';
import {
  globalState,
  IGlobalStateService,
  IAdminFullWidth,
} from 'services/globalState';

// resources
import GetClustering, {
  GetClusteringChildProps,
} from '../../../resources/GetClustering';

// styling
import styled, { ThemeProvider } from 'styled-components';
import { colors, media } from 'utils/styleUtils';

// analytics
import { injectTracks } from 'utils/analytics';
import tracks from '../tracks';

const TwoColumns = styled.div`
  flex-shrink: 0;
  flex-grow: 1;
  flex-basis: auto;
  width: 100%;
  height: calc(100vh - ${(props) => props.theme.menuHeight}px - 85px);
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  margin-bottom: 35px;
`;

const StyledCircles = styled(Circles)`
  flex-shrink: 1;
  flex-grow: 1;
  flex-basis: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  border: solid 1px ${colors.separation};
  border-radius: ${(props: any) => props.theme.borderRadius};
  padding: 25px;
`;

const StyledInfoPane = styled(InfoPane)`
  flex: 0 0 350px;
  margin-left: 20px;

  ${media.smallerThan1280px`
    flex:  0 0 300px;
  `}
`;

const StyledGoBackButton = styled(GoBackButton)`
  margin-bottom: 20px;
`;

interface InputProps {}

interface DataProps {
  clustering: GetClusteringChildProps;
}

type TrackArgs = { extra: { id: string; type?: string } };

interface TrackProps {
  trackClickCluster: (args: TrackArgs) => void;
  trackCtrlClickCluster: (args: TrackArgs) => void;
  trackShiftClickCluster: (args: TrackArgs) => void;
  trackClickIdea: (args: TrackArgs) => void;
  trackCtrlClickIdea: (args: TrackArgs) => void;
  trackShiftClickIdea: (args: TrackArgs) => void;
}

interface Props extends InputProps, DataProps {}

interface State {
  activeComparisonCount: number;
  selectedNodes: Node[][];
}

class ClusterViewer extends PureComponent<
  Props & WithRouterProps & TrackProps,
  State
> {
  globalState: IGlobalStateService<IAdminFullWidth>;

  constructor(props) {
    super(props);
    this.state = {
      activeComparisonCount: 0,
      selectedNodes: [[]],
    };
    this.globalState = globalState.init('AdminFullWidth');
  }

  componentDidMount() {
    this.globalState.set({ enabled: true });
  }

  componentWillUnmount() {
    this.globalState.set({ enabled: false });
  }

  theme = (theme) => {
    const comparisonColors = ['#fbbd08', '#a333c8', '#f2711c', '#00b5ad'];

    return {
      ...theme,
      comparisonColors,
      upvotes: theme.colors.clGreen,
      downvotes: theme.colors.clRed,
      chartLabelColor: '#999999',
      chartLabelSize: 13,
    };
  };

  handleOnChangeActiveComparison = (activeComparisonCount: number) => {
    this.setState({ activeComparisonCount });
  };

  handleOnAddComparison = () => {
    this.setState(({ selectedNodes }) => ({
      selectedNodes: [...selectedNodes, []],
      activeComparisonCount: selectedNodes.length,
    }));
  };

  handleOnDeleteComparison = (index: number) => {
    const { activeComparisonCount, selectedNodes } = this.state;
    const newSelectedNodes = clone(selectedNodes);
    newSelectedNodes.splice(index, 1);
    const newActiveComparison =
      activeComparisonCount >= index
        ? newSelectedNodes.length - 1
        : activeComparisonCount;
    this.setState({
      selectedNodes: newSelectedNodes,
      activeComparisonCount: newActiveComparison,
    });
  };

  handleOnClickNode = (node: Node) => {
    if (node.type === 'idea') {
      this.props.trackClickIdea({ extra: { id: node.id } });
    } else {
      this.props.trackClickCluster({ extra: { type: node.type, id: node.id } });
    }
    this.setState({
      selectedNodes: [[node]],
      activeComparisonCount: 0,
    });
  };

  handleOnShiftClickNode = (node: Node) => {
    if (node.type === 'idea') {
      this.props.trackShiftClickIdea({ extra: { id: node.id } });
    } else {
      this.props.trackShiftClickCluster({
        extra: { type: node.type, id: node.id },
      });
    }

    const selectedNodes = clone(this.state.selectedNodes);
    selectedNodes[this.state.activeComparisonCount] = [
      ...this.state.selectedNodes[this.state.activeComparisonCount],
      node,
    ];
    this.setState({ selectedNodes });
  };

  handleOnCtrlClickNode = (node: Node) => {
    if (node.type === 'idea') {
      this.props.trackCtrlClickIdea({ extra: { id: node.id } });
    } else {
      this.props.trackCtrlClickCluster({
        extra: { type: node.type, id: node.id },
      });
    }
    const { selectedNodes } = this.state;
    // prevents selecting twice the same node by looking for [node] in the selected nodes array.
    if (
      selectedNodes.length < 4 &&
      selectedNodes.findIndex(
        (item) => item.length === 1 && item[0].id === node.id
      ) < 0
    ) {
      this.setState(({ selectedNodes }) => ({
        selectedNodes: [...selectedNodes, [node]],
        activeComparisonCount: selectedNodes.length,
      }));
    }
  };

  goBack = () => {
    clHistory.push('/admin/dashboard/insights');
  };

  render() {
    const { clustering } = this.props;
    const { activeComparisonCount, selectedNodes } = this.state;

    if (isNilOrError(clustering)) return null;

    return (
      <>
        <StyledGoBackButton onClick={this.goBack} />
        <PageTitle>
          <T value={clustering.attributes.title_multiloc} />
        </PageTitle>
        <ThemeProvider theme={this.theme}>
          <TwoColumns>
            <StyledCircles
              activeComparison={activeComparisonCount}
              selectedNodes={selectedNodes}
              structure={clustering.attributes.structure}
              onClickNode={this.handleOnClickNode}
              onShiftClickNode={this.handleOnShiftClickNode}
              onCtrlClickNode={this.handleOnCtrlClickNode}
            />
            <StyledInfoPane
              activeComparison={activeComparisonCount}
              selectedNodes={selectedNodes}
              onAddComparison={this.handleOnAddComparison}
              onChangeActiveComparison={this.handleOnChangeActiveComparison}
              onDeleteComparison={this.handleOnDeleteComparison}
            />
          </TwoColumns>
        </ThemeProvider>
      </>
    );
  }
}

const ClusterViewerWithHocs = injectTracks<Props>({
  trackClickCluster: tracks.clickCluster,
  trackCtrlClickCluster: tracks.ctrlClickCluster,
  trackShiftClickCluster: tracks.shiftClickCluster,
  trackClickIdea: tracks.clickIdea,
  trackCtrlClickIdea: tracks.ctrlClickIdea,
  trackShiftClickIdea: tracks.shiftClickIdea,
})(ClusterViewer);

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetClustering id={inputProps.params.clusteringId}>
    {(clustering) => (
      <ClusterViewerWithHocs {...inputProps} clustering={clustering} />
    )}
  </GetClustering>
));
