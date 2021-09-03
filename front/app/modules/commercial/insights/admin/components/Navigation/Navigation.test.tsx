import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import Navigation from './';

const defaultProps = {
  moveUp: jest.fn(),
  moveDown: jest.fn(),
  isMoveUpDisabled: false,
  isMoveDownDisabled: false,
};

describe('Insights Input Details Navigation', () => {
  it('renders', () => {
    render(<Navigation {...defaultProps} />);
    expect(
      screen.getByTestId('insightsInputDetailNavigation')
    ).toBeInTheDocument();
  });
  it('moves up on button click', () => {
    const moveUp = jest.fn();
    render(<Navigation {...defaultProps} moveUp={moveUp} />);
    const upButton = screen
      .getByTestId('insightsInputDetailNavigation')
      .querySelector('#insightsInputDetailNavigationUp');
    if (upButton) {
      fireEvent.click(upButton);
    }
    expect(moveUp).toHaveBeenCalled();
  });
  it('moves down on button click', () => {
    const moveDown = jest.fn();
    render(<Navigation {...defaultProps} moveDown={moveDown} />);
    const downButton = screen
      .getByTestId('insightsInputDetailNavigation')
      .querySelector('#insightsInputDetailNavigationDown');
    if (downButton) {
      fireEvent.click(downButton);
    }
    expect(moveDown).toHaveBeenCalled();
  });
  it('moves up on key press', () => {
    const moveUp = jest.fn();
    render(<Navigation {...defaultProps} moveUp={moveUp} />);
    fireEvent.keyDown(screen.getByTestId('insightsInputDetailNavigation'), {
      key: 'ArrowUp',
      code: 'ArrowUp',
    });

    expect(moveUp).toHaveBeenCalled();
  });
  it('moves down on key press', () => {
    const moveDown = jest.fn();
    render(<Navigation {...defaultProps} moveDown={moveDown} />);
    fireEvent.keyDown(screen.getByTestId('insightsInputDetailNavigation'), {
      key: 'ArrowDown',
      code: 'ArrowDown',
    });

    expect(moveDown).toHaveBeenCalled();
  });
  it('does not move up when upDisabled', () => {
    const moveUp = jest.fn();
    render(
      <Navigation {...defaultProps} moveUp={moveUp} isMoveUpDisabled={true} />
    );
    const upButton = screen
      .getByTestId('insightsInputDetailNavigation')
      .querySelector('#insightsInputDetailNavigationUp');
    if (upButton) {
      fireEvent.click(upButton);
    }

    fireEvent.keyDown(screen.getByTestId('insightsInputDetailNavigation'), {
      key: 'ArrowUp',
      code: 'ArrowUp',
    });

    expect(moveUp).toHaveBeenCalledTimes(0);
  });
  it('does not move down when isMoveUpDisabled', () => {
    const moveDown = jest.fn();
    render(
      <Navigation
        {...defaultProps}
        moveDown={moveDown}
        isMoveDownDisabled={true}
      />
    );
    const downButton = screen
      .getByTestId('insightsInputDetailNavigation')
      .querySelector('#insightsInputDetailNavigationDown');
    if (downButton) {
      fireEvent.click(downButton);
    }

    fireEvent.keyDown(screen.getByTestId('insightsInputDetailNavigation'), {
      key: 'ArrowDown',
      code: 'ArrowDown',
    });

    expect(moveDown).toHaveBeenCalledTimes(0);
  });
});
