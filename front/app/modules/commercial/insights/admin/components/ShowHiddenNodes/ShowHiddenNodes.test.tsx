import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import ShowHiddenNodes from './';

const defaultNode = {
  val: 0,
  color: '',
  color_index: 0,
  cluster_id: '',
  nodeVerticalOffset: 0,
  textWidth: 0,
  globalScale: 0,
  nodeFontSize: 0,
};
const getHiddenNodes = (n) =>
  [...Array(n)].map((_, i) => ({
    ...defaultNode,
    id: `${i}`,
    name: `name-${i}`,
  }));
const hiddenNodes = getHiddenNodes(5);
const handleShowHiddenNodesClick = () => {};

describe('Show hidden keyword network nodes', () => {
  it('should render ShowHiddenNodes', () => {
    render(
      <ShowHiddenNodes
        hiddenNodes={hiddenNodes}
        handleShowHiddenNodesClick={handleShowHiddenNodesClick}
      />
    );
    expect(screen.getByTestId('insightsShowHiddenNodes')).toBeInTheDocument();
  });

  it('should not render ShowHiddenNodes', () => {
    render(
      <ShowHiddenNodes
        hiddenNodes={[]}
        handleShowHiddenNodesClick={handleShowHiddenNodesClick}
      />
    );
    expect(
      screen.queryByTestId('insightsShowHiddenNodes')
    ).not.toBeInTheDocument();
  });

  it('should show a correct node count', () => {
    render(
      <ShowHiddenNodes
        hiddenNodes={hiddenNodes}
        handleShowHiddenNodesClick={handleShowHiddenNodesClick}
      />
    );
    expect(screen.getByText('Show hidden (5)')).toBeInTheDocument();
  });

  it('should show tooltip with hidden node names', () => {
    render(
      <ShowHiddenNodes
        hiddenNodes={hiddenNodes}
        handleShowHiddenNodesClick={handleShowHiddenNodesClick}
      />
    );
    fireEvent.mouseEnter(screen.getByTestId('insightsShowHiddenNodesContent'));
    expect(screen.getByText('name-0')).toBeInTheDocument();
    expect(screen.getByText('name-1')).toBeInTheDocument();
    expect(screen.getByText('name-2')).toBeInTheDocument();
    expect(screen.getByText('name-3')).toBeInTheDocument();
    expect(screen.getByText('name-4')).toBeInTheDocument();
  });

  it('should show ellipsis in tooltip if more than 10 nodes', () => {
    const hiddenNodes11 = getHiddenNodes(11);
    render(
      <ShowHiddenNodes
        hiddenNodes={hiddenNodes11}
        handleShowHiddenNodesClick={handleShowHiddenNodesClick}
      />
    );
    fireEvent.mouseEnter(screen.getByTestId('insightsShowHiddenNodesContent'));
    expect(screen.getByText('...')).toBeInTheDocument();
  });
});
