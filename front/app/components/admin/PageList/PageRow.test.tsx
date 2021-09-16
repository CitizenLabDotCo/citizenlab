import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import PageRow from './PageRow';
import messages from './messages';

jest.mock('services/locale');
jest.mock('services/appConfiguration');

const testPageData = {
  id: '_1',
  type: 'page',
  attributes: {
    title_multiloc: { en: 'English title 1' },
    body_multiloc: { en: 'English page body' },
    slug: 'page_slug',
    created_at: '16-09-2021',
    updated_at: '16-09-2021',
  },
  relationships: {
    project: { data: [] },
    page_links: { data: [] },
  },
};

describe('<PageRow />', () => {
  it('renders', () => {
    render(<PageRow pageData={testPageData} pagePermissions={{}} />);
    expect(screen.getByTestId('page-row')).toBeInTheDocument();
    expect(screen.getByText('English title 1')).toBeInTheDocument();
  });

  it('renders "DEFAULT" tag if needed', () => {
    render(
      <PageRow
        pageData={testPageData}
        pagePermissions={{ isDefaultPage: true }}
      />
    );
    expect(screen.getByTestId('default-tag')).toBeInTheDocument();
  });

  it('renders add button if needed', () => {
    render(
      <PageRow
        pageData={testPageData}
        pagePermissions={{ hasAddButton: true }}
      />
    );
    expect(
      screen.getByText(messages.addButton.defaultMessage!)
    ).toBeInTheDocument();
  });

  it('calls onClickAddButton when add button is clicked', () => {
    const onClickAddButton = jest.fn();

    render(
      <PageRow
        pageData={testPageData}
        pagePermissions={{ hasAddButton: true }}
        onClickAddButton={onClickAddButton}
      />
    );

    const addButton = screen.getByText(messages.addButton.defaultMessage!);
    fireEvent.click(addButton);

    expect(onClickAddButton).toHaveBeenLastCalledWith('_1');
  });

  it('renders hide button if needed', () => {
    render(
      <PageRow
        pageData={testPageData}
        pagePermissions={{ hasHideButton: true }}
      />
    );
    expect(
      screen.getByText(messages.hideButton.defaultMessage!)
    ).toBeInTheDocument();
  });

  it('calls onClickHideButton when add button is clicked', () => {
    const onClickHideButton = jest.fn();

    render(
      <PageRow
        pageData={testPageData}
        pagePermissions={{ hasHideButton: true }}
        onClickHideButton={onClickHideButton}
      />
    );

    const hideButton = screen.getByText(messages.hideButton.defaultMessage!);
    fireEvent.click(hideButton);

    expect(onClickHideButton).toHaveBeenLastCalledWith('_1');
  });
});
