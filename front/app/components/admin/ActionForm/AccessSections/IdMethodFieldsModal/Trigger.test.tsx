import React from 'react';

import { IdMethodData } from 'api/id_methods/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import Trigger from './Trigger';

// The trigger only appears when the platform actually has identification
// methods in use, and it names the method when there is exactly one.
let mockIdMethods: { data: IdMethodData[] } | undefined = { data: [] };

jest.mock('api/id_methods/useIdMethods', () =>
  jest.fn(() => ({ data: mockIdMethods }))
);

jest.mock('hooks/useAuthMethodNames', () => ({
  ...jest.requireActual('hooks/useAuthMethodNames'),
  __esModule: true,
  default: jest.fn(() => ({ franceconnect: 'FranceConnect' })),
}));

// The modal itself is covered by its own test.
let modalOpened = false;
jest.mock('./index', () => (props: { opened: boolean }) => {
  modalOpened = props.opened;
  return null;
});

const buildMethod = ({
  id = 'method-1',
  name = 'fake_sso',
  authentication = false,
  verification = true,
  metadataName = 'ItsMe',
}: {
  id?: string;
  name?: string;
  authentication?: boolean;
  verification?: boolean;
  metadataName?: string;
} = {}): IdMethodData =>
  ({
    id,
    type: 'id_method',
    attributes: {
      name,
      authentication_method: authentication,
      verification_method: verification,
      method_metadata: { name: metadataName },
    },
  } as IdMethodData);

// The render wrapper always mounts a modal portal, so "renders nothing" is
// asserted on the link itself rather than on an empty container.
const queryLink = () =>
  screen.queryByText(/View .* settings|See which identification methods/);

beforeEach(() => {
  mockIdMethods = { data: [] };
  modalOpened = false;
});

describe('<Trigger />', () => {
  describe('with a single active identification method', () => {
    beforeEach(() => {
      mockIdMethods = { data: [buildMethod()] };
    });

    it('names the method in the link', () => {
      render(<Trigger />);
      expect(screen.getByText('View ItsMe settings')).toBeInTheDocument();
    });

    it('opens the modal when clicked', async () => {
      render(<Trigger />);
      expect(modalOpened).toBe(false);

      await userEvent.click(screen.getByText('View ItsMe settings'));

      expect(modalOpened).toBe(true);
    });
  });

  describe('with several active identification methods', () => {
    it('uses a generic link that does not name a single method', () => {
      mockIdMethods = {
        data: [
          buildMethod({ id: 'method-1' }),
          buildMethod({
            id: 'method-2',
            name: 'franceconnect',
            authentication: true,
            verification: false,
          }),
        ],
      };
      render(<Trigger />);

      expect(
        screen.getByText('See which identification methods are enabled')
      ).toBeInTheDocument();
      expect(screen.queryByText(/View ItsMe/)).toBeNull();
    });
  });

  describe('without any active identification method', () => {
    it('renders nothing at all', () => {
      mockIdMethods = { data: [] };
      render(<Trigger />);
      expect(queryLink()).toBeNull();
    });

    it('renders nothing for methods that are neither authentication nor verification methods', () => {
      mockIdMethods = {
        data: [buildMethod({ authentication: false, verification: false })],
      };
      render(<Trigger />);
      expect(queryLink()).toBeNull();
    });

    it('renders nothing while the methods are still loading', () => {
      mockIdMethods = undefined;
      render(<Trigger />);
      expect(queryLink()).toBeNull();
    });
  });
});
