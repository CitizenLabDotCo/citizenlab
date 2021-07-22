import React from 'react';
import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';
import clHistory from 'utils/cl-router/history';

import Categories, { visibleCategoriesNumber } from './Categories';

let mockData = [
  {
    id: '727a021c-d1f9-4006-a5c2-8532aa779dd6',
    type: 'category',
    attributes: { name: 'Nature and animals', inputs_count: 0 },
    relationships: {
      view: {
        data: { id: '8143a5e3-71f2-4a8d-bdac-da60e0a9945c', type: 'view' },
      },
    },
  },
  {
    id: '113eb7ba-8a3f-4d6d-8e2c-22c2da4fe89f',
    type: 'category',
    attributes: { name: 'Cleanliness and waste', inputs_count: 0 },
    relationships: {
      view: {
        data: { id: '8143a5e3-71f2-4a8d-bdac-da60e0a9945c', type: 'view' },
      },
    },
  },
  {
    id: 'b8f8db41-f194-4f23-94cf-c4953ba7ebc8',
    type: 'category',
    attributes: { name: 'Sustainable development', inputs_count: 0 },
    relationships: {
      view: {
        data: { id: '8143a5e3-71f2-4a8d-bdac-da60e0a9945c', type: 'view' },
      },
    },
  },
  {
    id: 'e0a43011-0635-4b3a-af45-39e243ff5f68',
    type: 'category',
    attributes: { name: 'Mobility', inputs_count: 0 },
    relationships: {
      view: {
        data: { id: '8143a5e3-71f2-4a8d-bdac-da60e0a9945c', type: 'view' },
      },
    },
  },
  {
    id: 'afa1b1ac-8bb4-4b3c-957b-64c140f0a1f0',
    type: 'category',
    attributes: { name: 'Energy and technology', inputs_count: 0 },
    relationships: {
      view: {
        data: { id: '8143a5e3-71f2-4a8d-bdac-da60e0a9945c', type: 'view' },
      },
    },
  },
  {
    id: '8d6017b6-56f1-4f23-832f-4f9c463dc943',
    type: 'category',
    attributes: { name: 'Work, economy and tourism', inputs_count: 0 },
    relationships: {
      view: {
        data: { id: '8143a5e3-71f2-4a8d-bdac-da60e0a9945c', type: 'view' },
      },
    },
  },
  {
    id: '16261e8c-83bd-4b66-bae8-003080dd37fb',
    type: 'category',
    attributes: { name: 'Housing', inputs_count: 0 },
    relationships: {
      view: {
        data: { id: '8143a5e3-71f2-4a8d-bdac-da60e0a9945c', type: 'view' },
      },
    },
  },
  {
    id: '0ebc459a-cff9-4d1b-9e9f-a041b0958660',
    type: 'category',
    attributes: { name: 'Public spaces and buildings', inputs_count: 0 },
    relationships: {
      view: {
        data: { id: '8143a5e3-71f2-4a8d-bdac-da60e0a9945c', type: 'view' },
      },
    },
  },
  {
    id: 'd3388b1e-3c11-4203-a02a-dc2c1be71725',
    type: 'category',
    attributes: { name: 'Safety', inputs_count: 0 },
    relationships: {
      view: {
        data: { id: '8143a5e3-71f2-4a8d-bdac-da60e0a9945c', type: 'view' },
      },
    },
  },
  {
    id: '79b88776-8f8e-4bf8-833e-21019bacc499',
    type: 'category',
    attributes: { name: 'Education and youth', inputs_count: 0 },
    relationships: {
      view: {
        data: { id: '8143a5e3-71f2-4a8d-bdac-da60e0a9945c', type: 'view' },
      },
    },
  },
  {
    id: '1e0af81f-5986-4be0-8f3c-710a0057b0cf',
    type: 'category',
    attributes: { name: 'Culture, sports and events', inputs_count: 0 },
    relationships: {
      view: {
        data: { id: '8143a5e3-71f2-4a8d-bdac-da60e0a9945c', type: 'view' },
      },
    },
  },
  {
    id: 'fb4d798c-b18c-4700-b2a3-03b17111e8de',
    type: 'category',
    attributes: { name: 'Health and welfare', inputs_count: 0 },
    relationships: {
      view: {
        data: { id: '8143a5e3-71f2-4a8d-bdac-da60e0a9945c', type: 'view' },
      },
    },
  },
  {
    id: 'caea0d05-b0d2-4e9d-8428-14480cfe305f',
    type: 'category',
    attributes: { name: 'Social inclusion', inputs_count: 0 },
    relationships: {
      view: {
        data: { id: '8143a5e3-71f2-4a8d-bdac-da60e0a9945c', type: 'view' },
      },
    },
  },
  {
    id: '4b5e309f-b27d-425d-b623-8644ade27e69',
    type: 'category',
    attributes: { name: 'Community development', inputs_count: 0 },
    relationships: {
      view: {
        data: { id: '8143a5e3-71f2-4a8d-bdac-da60e0a9945c', type: 'view' },
      },
    },
  },
  {
    id: '068895a6-86c7-4bc7-bf79-72315942350f',
    type: 'category',
    attributes: { name: 'Public services', inputs_count: 0 },
    relationships: {
      view: {
        data: { id: '8143a5e3-71f2-4a8d-bdac-da60e0a9945c', type: 'view' },
      },
    },
  },
  {
    id: '7b446395-0ade-4910-b133-d668389a0ae4',
    type: 'category',
    attributes: { name: 'Other', inputs_count: 0 },
    relationships: {
      view: {
        data: { id: '8143a5e3-71f2-4a8d-bdac-da60e0a9945c', type: 'view' },
      },
    },
  },
];

jest.mock('utils/cl-intl');

jest.mock('modules/commercial/insights/hooks/useInsightsCategories', () => {
  return jest.fn(() => mockData);
});

jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));

const viewId = '1';

const mockLocationData = { pathname: '', query: {} };

jest.mock('react-router', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return (
          <Component
            {...props}
            params={{ viewId }}
            location={mockLocationData}
          />
        );
      };
    },
    Link: () => <>Link</>,
  };
});

describe('Insights Details Categories', () => {
  it('renders Categories', () => {
    render(<Categories />);
    expect(screen.getByTestId('insightsDetailsCategories')).toBeInTheDocument();
  });

  it('renders correct number of categories', () => {
    render(<Categories />);
    expect(screen.getAllByTestId('insightsTag')).toHaveLength(
      visibleCategoriesNumber
    );
  });

  it('renders correct number of categories on See all and See less click', async () => {
    render(<Categories />);
    fireEvent.click(screen.getByText('See all'));
    expect(screen.getAllByTestId('insightsTag')).toHaveLength(mockData.length);
    fireEvent.click(screen.getByText('See less'));
    await waitFor(() =>
      expect(screen.getAllByTestId('insightsTag')).toHaveLength(
        visibleCategoriesNumber
      )
    );
  });

  it('does not render See all button when categories are less then visibleCategoriesNumber', () => {
    mockData = [
      {
        id: '727a021c-d1f9-4006-a5c2-8532aa779dd6',
        type: 'category',
        attributes: { name: 'Nature and animals', inputs_count: 0 },
        relationships: {
          view: {
            data: { id: '8143a5e3-71f2-4a8d-bdac-da60e0a9945c', type: 'view' },
          },
        },
      },
    ];
    render(<Categories />);

    expect(screen.queryByText('See all')).not.toBeInTheDocument();
  });

  it('selects category correctly', () => {
    const spy = jest.spyOn(clHistory, 'push');
    render(<Categories />);
    fireEvent.click(screen.getByText(mockData[0].attributes.name));
    expect(spy).toHaveBeenCalledWith({
      pathname: '',
      search: `?category=${mockData[0].id}`,
    });
  });

  it('renders Empty state when there are no categories', () => {
    mockData = [];
    render(<Categories />);
    expect(
      screen.getByTestId('insightsDetailsCategoriesEmpty')
    ).toBeInTheDocument();
  });
});
