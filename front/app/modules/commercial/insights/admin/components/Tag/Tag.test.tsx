import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import Tag, { TagProps } from './';

const defaultTagProps = {
  label: 'Label',
  onIconClick: () => {},
  status: 'approved',
} as TagProps;

describe('Tag', () => {
  it('should render', () => {
    render(<Tag {...defaultTagProps} />);
    expect(screen.getByTestId('insightsTag')).toBeInTheDocument();
    expect(screen.getByText(defaultTagProps.label)).toBeInTheDocument();
  });
  it('should correct icon when approved', () => {
    const { container } = render(<Tag {...defaultTagProps} />);
    expect(
      container.querySelector('.insightsTagCloseIcon')
    ).toBeInTheDocument();
  });
  it('should correct icon when suggested', () => {
    const { container } = render(
      <Tag {...defaultTagProps} status="suggested" />
    );
    expect(container.querySelector('.insightsTagPlusIcon')).toBeInTheDocument();
  });
  it('should call onIconClick correctly', () => {
    const onIconClick = jest.fn();
    render(<Tag {...defaultTagProps} onIconClick={onIconClick} />);
    fireEvent.click(screen.getByTestId('insightsTagIconContainer'));
    expect(onIconClick).toHaveBeenCalled();
  });
});
