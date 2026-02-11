import React from 'react';

import { RouteType } from 'routes';

import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import NavbarItemRow from '.';

const title = { en: 'English title' };

describe('<NavbarItemRow />', () => {
  it('renders', () => {
    render(<NavbarItemRow title={title} />);

    expect(screen.getByTestId('navbar-item-row')).toBeInTheDocument();
    expect(screen.getByText('English title')).toBeInTheDocument();
  });

  it('renders "DEFAULT" tag if needed', () => {
    render(<NavbarItemRow title={title} isDefaultPage />);
    expect(screen.getByTestId('default-tag')).toBeInTheDocument();
  });

  it('renders edit button if needed', () => {
    render(<NavbarItemRow title={title} showEditButton />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('calls onClickEditButton when edit button is clicked', () => {
    const onClickEditButton = jest.fn();

    render(
      <NavbarItemRow
        title={title}
        showEditButton
        onClickEditButton={onClickEditButton}
      />
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(onClickEditButton).toHaveBeenCalledTimes(1);
  });

  it('renders add button if needed', () => {
    render(<NavbarItemRow title={title} showAddButton />);
    expect(screen.getByText('Add to navbar')).toBeInTheDocument();
  });

  it('calls onClickAddButton when add button is clicked', () => {
    const onClickAddButton = jest.fn();

    render(
      <NavbarItemRow
        title={title}
        showAddButton
        onClickAddButton={onClickAddButton}
      />
    );

    const addButton = screen.getByText('Add to navbar');
    fireEvent.click(addButton);

    expect(onClickAddButton).toHaveBeenCalledTimes(1);
  });

  it('disables add button when addButtonDisabled', () => {
    const onClickAddButton = jest.fn();

    render(
      <NavbarItemRow
        title={title}
        showAddButton
        addButtonDisabled
        onClickAddButton={onClickAddButton}
      />
    );

    const addButton = screen.getByText('Add to navbar');
    fireEvent.click(addButton);

    expect(onClickAddButton).not.toHaveBeenCalled();
  });

  it('renders hide button if showHideButton', () => {
    render(<NavbarItemRow title={title} showRemoveButton />);
    expect(screen.getByText('Remove from navbar')).toBeInTheDocument();
  });

  it('calls onClickHideButton when add button is clicked', () => {
    const onClickRemoveButton = jest.fn();

    render(
      <NavbarItemRow
        title={title}
        showRemoveButton
        onClickRemoveButton={onClickRemoveButton}
      />
    );

    const hideButton = screen.getByText('Remove from navbar');
    fireEvent.click(hideButton);

    expect(onClickRemoveButton).toHaveBeenCalledTimes(1);
  });

  it('render view button if viewButtonLink is provided', () => {
    render(
      <NavbarItemRow title={title} viewButtonLink={'/some/link' as RouteType} />
    );
    expect(screen.getByText('View')).toBeInTheDocument();
  });
});
