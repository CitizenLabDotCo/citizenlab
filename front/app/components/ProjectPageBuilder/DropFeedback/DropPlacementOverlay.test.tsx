import React from 'react';

import { EditorState, ROOT_NODE } from '@craftjs/core';

import { render, screen, act } from 'utils/testUtils/rtl';

import DropPlacementOverlay from './DropPlacementOverlay';

const BODY_ID = 'PROJECT_PAGE_BODY';

let editorState: EditorState;

jest.mock('@craftjs/core', () => {
  const originalModule = jest.requireActual('@craftjs/core');
  return {
    ...originalModule,
    useEditor: (collector: (state: EditorState) => unknown) =>
      collector(editorState),
  };
});

const elementAt = (top: number) => {
  const element = document.createElement('div');
  element.getBoundingClientRect = () =>
    ({
      top,
      bottom: top + 100,
      left: 0,
      right: 500,
      width: 500,
      height: 100,
    } as DOMRect);
  return element;
};

const buildState = (
  error: string | null,
  parentId: string,
  currentNodeName = 'PhasesWidget',
  where: 'before' | 'after' = 'before'
): EditorState =>
  ({
    nodes: {
      [ROOT_NODE]: { dom: elementAt(0), data: { name: 'ProjectPageRoot' } },
      [BODY_ID]: { dom: elementAt(300), data: { name: 'ProjectPageBody' } },
    },
    indicator: {
      placement: {
        parent: { id: parentId, dom: elementAt(300) },
        index: 0,
        where,
        currentNode: { dom: elementAt(300), data: { name: currentNodeName } },
      },
      error,
    },
  } as unknown as EditorState);

const startDrag = () => {
  const source = document.createElement('div');
  source.setAttribute('draggable', 'true');
  document.body.appendChild(source);

  act(() => {
    source.dispatchEvent(new Event('dragstart', { bubbles: true }));
  });
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('DropPlacementOverlay', () => {
  it('renders nothing while no drag is running', () => {
    editorState = buildState(null, BODY_ID);
    render(<DropPlacementOverlay />);

    expect(screen.queryByText('Place here')).not.toBeInTheDocument();
  });

  it('invites the drop when the placement is accepted', () => {
    editorState = buildState(null, BODY_ID);
    render(<DropPlacementOverlay />);
    startDrag();

    expect(screen.getByText('Place here')).toBeInTheDocument();
    expect(
      screen.queryByText('The project image and title are fixed')
    ).not.toBeInTheDocument();
  });

  it('explains the fixed header when the placement lands above the body', () => {
    editorState = buildState(
      'Parent node cannot accept incoming node',
      ROOT_NODE,
      'ProjectTitle'
    );
    render(<DropPlacementOverlay />);
    startDrag();

    expect(
      screen.getByText("Can't place widgets in the fixed header")
    ).toBeInTheDocument();
    expect(
      screen.getByText('The project image and title are fixed')
    ).toBeInTheDocument();
  });

  it('leaves the fixed zone alone when the placement slips below the body', () => {
    editorState = buildState(
      'Parent node cannot accept incoming node',
      ROOT_NODE,
      'ProjectPageBody',
      'after'
    );
    render(<DropPlacementOverlay />);
    startDrag();

    expect(
      screen.getByText("Can't place widgets below the page content")
    ).toBeInTheDocument();
    expect(
      screen.queryByText('The project image and title are fixed')
    ).not.toBeInTheDocument();
  });
});
