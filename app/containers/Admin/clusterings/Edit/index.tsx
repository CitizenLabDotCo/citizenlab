import React, { PureComponent } from 'react';
import { clone } from 'lodash';
import Circles from './Circles';
import { Node } from 'services/clusterings';
import InfoPane from './InfoPane';
import styled, { ThemeProvider } from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import GetClustering, { GetClusteringChildProps } from 'resources/GetClustering';
import { withRouter, WithRouterProps } from 'react-router';
import { globalState, IGlobalStateService, IAdminFullWidth } from 'services/globalState';
// import anzegemCluster from './anzegem.json';

const Container = styled.div`
  margin: 20px;
`;

const TwoColumns = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
`;

const StyledCircles = styled(Circles)`
  flex: 1;
  /* background: #fff;
  border: solid 1px #eee;
  border-radius: 5px;
  padding: 10px; */
`;

const StyledInfoPane = styled(InfoPane)`
  width: 100%;
  max-width: 350px;
  margin-left: 20px;
`;

interface InputProps {}

interface DataProps {
  clustering: GetClusteringChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  // clustering?: ParentNode;
  activeComparison: number;
  selectedNodes: Node[][];
}

class ClusterViewer extends PureComponent<Props & WithRouterProps, State> {
  globalState: IGlobalStateService<IAdminFullWidth>;

  constructor(props: Props & WithRouterProps) {
    super(props);
    this.state = {
      // clustering: anzegemCluster,
      activeComparison: 0,
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

  comparisonSet = () => {
    return this.state.selectedNodes[this.state.activeComparison];
  }

  theme = () => (theme) => {
    const comparisonColors = ['#fbbd08', '#a333c8', '#f2711c', '#00b5ad'];
    return {
      ...theme,
      comparisonColors,
      selectionColor: comparisonColors[this.state.activeComparison],
      upvotes: theme.colors.success,
      downvotes: theme.colors.error,
      chartLabelColor: '#999999',
      chartLabelSize: 13
    };
  }

  handleOnChangeActiveComparison = (activeComparison) => {
    this.setState({ activeComparison });
  }

  handleOnAddComparison = () => {
    this.setState({
      selectedNodes: [...this.state.selectedNodes, []],
      activeComparison: this.state.selectedNodes.length,
    });
  }

  handleOnDeleteComparison = (index: number) => {
    const { activeComparison, selectedNodes } = this.state;
    const newSelectedNodes = clone(selectedNodes);
    newSelectedNodes.splice(index, 1);
    const newActiveComparison = activeComparison >= index ? newSelectedNodes.length - 1 : activeComparison;
    this.setState({
      selectedNodes: newSelectedNodes,
      activeComparison: newActiveComparison,
    });
  }

  handleOnClickNode = (node: Node) => {
    const selectedNodes = clone(this.state.selectedNodes);
    selectedNodes[this.state.activeComparison] = [node];
    this.setState({ selectedNodes });
  }

  handleOnShiftClickNode = (node: Node) => {
    const selectedNodes = clone(this.state.selectedNodes);
    selectedNodes[this.state.activeComparison] = [...this.comparisonSet(), node];
    this.setState({ selectedNodes });
  }

  render() {
    const { clustering } = this.props;
    const { activeComparison, selectedNodes } = this.state;

    if (isNilOrError(clustering)) return null;

    return (
      <Container>
        <ThemeProvider theme={this.theme()}>
          <TwoColumns>
            <StyledCircles
              structure={clustering.attributes.structure}
              selectedNodes={this.comparisonSet()}
              onClickNode={this.handleOnClickNode}
              onShiftClickNode={this.handleOnShiftClickNode}
            />
            <StyledInfoPane
              activeComparison={activeComparison}
              selectedNodes={selectedNodes}
              onAddComparison={this.handleOnAddComparison}
              onChangeActiveComparison={this.handleOnChangeActiveComparison}
              onDeleteComparison={this.handleOnDeleteComparison}
            />
          </TwoColumns>
        </ThemeProvider>
      </Container>
    );
  }
}

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetClustering id={inputProps.params.clusteringId}>
    {(clustering) => <ClusterViewer {...inputProps} clustering={clustering} />}
  </GetClustering>
));
