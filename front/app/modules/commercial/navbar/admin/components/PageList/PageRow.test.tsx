import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import PageRow from './PageRow';

jest.mock('services/locale');
jest.mock('services/appConfiguration');

const testNavbarItem = {
  id: '_1',
  type: 'navbar_item',
  attributes: {
    title_multiloc: { en: 'English title 1' },
    ordering: 0,
    visible: true,
    type: 'custom',
    created_at: '04-10-2021',
    updated_at: '04-10-2021',
  },
  relationships: { page: { data: [{ id: '_1', type: 'page' }] } },
};

describe('<PageRow />', () => {
  it('renders', () => {
    render(<PageRow navbarItem={testNavbarItem} displaySettings={{}} />);

    expect(screen.getByTestId('page-row')).toBeInTheDocument();
    expect(screen.getByText('English title 1')).toBeInTheDocument();
  });

  it('renders "DEFAULT" tag if needed', () => {
    render(
      <PageRow
        navbarItem={testNavbarItem}
        displaySettings={{ isDefaultPage: true }}
      />
    );
    expect(screen.getByTestId('default-tag')).toBeInTheDocument();
  });

  it('renders add button if needed', () => {
    render(
      <PageRow
        navbarItem={testNavbarItem}
        displaySettings={{ hasAddButton: true }}
      />
    );
    expect(screen.getByText('Add to navbar')).toBeInTheDocument();
  });

  it('calls onClickAddButton when add button is clicked', () => {
    const onClickAddButton = jest.fn();

    render(
      <PageRow
        navbarItem={testNavbarItem}
        displaySettings={{ hasAddButton: true }}
        onClickAddButton={onClickAddButton}
      />
    );

    const addButton = screen.getByText('Add to navbar');
    fireEvent.click(addButton);

    expect(onClickAddButton).toHaveBeenLastCalledWith('_1');
  });

  it('disables add button when needed', () => {
    const onClickAddButton = jest.fn();

    render(
      <PageRow
        navbarItem={testNavbarItem}
        displaySettings={{ hasAddButton: true, addButtonDisabled: true }}
        onClickAddButton={onClickAddButton}
      />
    );

    // TODO check that button is indeed disabled

    const addButton = screen.getByText('Add to navbar');
    fireEvent.click(addButton);

    expect(onClickAddButton).not.toHaveBeenCalled();
  });

  it('renders hide button if needed', () => {
    render(
      <PageRow
        navbarItem={testNavbarItem}
        displaySettings={{ hasHideButton: true }}
      />
    );
    expect(screen.getByText('Hide page')).toBeInTheDocument();
  });

  it('calls onClickHideButton when add button is clicked', () => {
    const onClickHideButton = jest.fn();

    render(
      <PageRow
        navbarItem={testNavbarItem}
        displaySettings={{ hasHideButton: true }}
        onClickHideButton={onClickHideButton}
      />
    );

    const hideButton = screen.getByText('Hide page');
    fireEvent.click(hideButton);

    expect(onClickHideButton).toHaveBeenLastCalledWith('_1');
  });
});
