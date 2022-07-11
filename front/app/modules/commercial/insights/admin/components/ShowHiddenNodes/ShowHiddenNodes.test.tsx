import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import ShowHiddenNodes, { NodeName } from './';

jest.mock('utils/cl-intl');

const getHiddenNodes = (n) =>
  [...Array(n)].map((_, i) => ({
    id: `${i}`,
    name: `name-${i}`,
  }));

const getMockData = (n: number): [NodeName[], string[]] => {
  const nodesNames = getHiddenNodes(n);
  const hiddenNodes = nodesNames.map(({ id }) => id);
  return [nodesNames, hiddenNodes];
};
const [nodesNames, hiddenNodes] = getMockData(5);

const handleShowHiddenNodesClick = () => {};

describe('Show hidden keyword network nodes', () => {
  it('should render ShowHiddenNodes', () => {
    render(
      <ShowHiddenNodes
        nodesNames={nodesNames}
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
        nodesNames={nodesNames}
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
        nodesNames={nodesNames}
        hiddenNodes={hiddenNodes}
        handleShowHiddenNodesClick={handleShowHiddenNodesClick}
      />
    );
    expect(screen.getByText('Show hidden (5)')).toBeInTheDocument();
  });

  it('should show tooltip with hidden node names', () => {
    render(
      <ShowHiddenNodes
        nodesNames={nodesNames}
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
    const [nodesNames, hiddenNodes] = getMockData(11);
    render(
      <ShowHiddenNodes
        nodesNames={nodesNames}
        hiddenNodes={hiddenNodes}
        handleShowHiddenNodesClick={handleShowHiddenNodesClick}
      />
    );
    fireEvent.mouseEnter(screen.getByTestId('insightsShowHiddenNodesContent'));
    expect(screen.getByText('...')).toBeInTheDocument();
  });
});
