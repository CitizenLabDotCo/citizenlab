import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import VisibleNavbarItemList from './VisibleNavbarItemList';
import messages from './messages';
import { visibleItems } from 'hooks/fixtures/navbarItems';

jest.mock('services/locale');
jest.mock('services/appConfiguration');

describe('<VisibleNavbarItemList />', () => {
  it('renders', () => {
    const navbarItems = visibleItems.slice(0, 3);

    render(
      <VisibleNavbarItemList navbarItems={navbarItems} lockFirstNItems={2} />
    );

    expect(messages.navigationItems.defaultMessage).toBeDefined();

    if (!messages.navigationItems.defaultMessage) return;

    expect(
      screen.getByText(messages.navigationItems.defaultMessage)
    ).toBeInTheDocument();
  });

  it('renders correct number of rows', () => {
    const navbarItems = visibleItems.slice(0, 5);

    render(
      <VisibleNavbarItemList navbarItems={navbarItems} lockFirstNItems={2} />
    );

    expect(screen.getAllByTestId('navbar-item-row')).toHaveLength(5);
  });

  it('render correct number of locked rows', () => {
    const navbarItems = visibleItems.slice(0, 5);

    render(
      <VisibleNavbarItemList navbarItems={navbarItems} lockFirstNItems={3} />
    );

    expect(screen.getAllByTestId('locked-row')).toHaveLength(3);
  });

  it('calls onClickHideButton with correct id', () => {
    const navbarItems = visibleItems.slice(0, 5);
    const onClickRemoveButton = jest.fn();

    render(
      <VisibleNavbarItemList
        navbarItems={navbarItems}
        lockFirstNItems={2}
        onClickRemoveButton={onClickRemoveButton}
      />
    );

    const removeButtons = screen.getAllByText('Remove from navbar');

    fireEvent.click(removeButtons[0]);
    expect(onClickRemoveButton).toHaveBeenCalledWith(
      '41a151ed-3d1b-42ab-838b-d8e1e7305a09'
    );
    fireEvent.click(removeButtons[1]);
    expect(onClickRemoveButton).toHaveBeenLastCalledWith(
      '9398677e-bce8-4577-b63d-3fcdf9a886ea'
    );
  });

  it('calls onReorder with correct id and position', () => {
    const navbarItems = visibleItems.slice(0, 5);
    const onReorder = jest.fn();

    render(
      <VisibleNavbarItemList
        navbarItems={navbarItems}
        lockFirstNItems={2}
        onReorder={onReorder}
      />
    );

    const rows = screen.getAllByTestId('navbar-item-row');

    const thirdItem = rows[2];
    const fifthItem = rows[4];

    fireEvent.dragStart(thirdItem);
    fireEvent.dragEnter(fifthItem);
    fireEvent.dragOver(fifthItem);
    fireEvent.drop(fifthItem);

    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(onReorder).toHaveBeenCalledWith(
      '41a151ed-3d1b-42ab-838b-d8e1e7305a09',
      4
    );
  });
});
