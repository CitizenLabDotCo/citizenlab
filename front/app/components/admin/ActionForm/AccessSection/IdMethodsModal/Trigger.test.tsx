import React from 'react';

import { IdMethodData } from 'api/id_methods/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import Trigger from './Trigger';

// The trigger only appears when the platform actually has identification
// methods in use. It speaks about identification in general, so it never names
// a single method — the sign-in card above it does that.
let mockIdMethods: { data: IdMethodData[] } | undefined = { data: [] };

jest.mock('api/id_methods/useIdMethods', () =>
  jest.fn(() => ({ data: mockIdMethods }))
);

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
}: {
  id?: string;
  name?: string;
  authentication?: boolean;
  verification?: boolean;
} = {}): IdMethodData =>
  ({
    id,
    type: 'id_method',
    attributes: {
      name,
      authentication_method: authentication,
      verification_method: verification,
      method_metadata: { name: 'ItsMe' },
    },
  } as IdMethodData);

// The render wrapper always mounts a modal portal, so "renders nothing" is
// asserted on the link itself rather than on an empty container.
const queryLink = () =>
  screen.queryByText('See which identification methods are enabled');

beforeEach(() => {
  mockIdMethods = { data: [] };
  modalOpened = false;
});

describe('<Trigger />', () => {
  describe('with active identification methods', () => {
    it('renders the generic link for a single method', () => {
      mockIdMethods = { data: [buildMethod()] };
      render(<Trigger />);

      expect(queryLink()).toBeInTheDocument();
      expect(screen.queryByText(/ItsMe/)).toBeNull();
    });

    it('renders the same link for several methods', () => {
      mockIdMethods = {
        data: [
          buildMethod(),
          buildMethod({
            id: 'method-2',
            name: 'franceconnect',
            authentication: true,
            verification: false,
          }),
        ],
      };
      render(<Trigger />);

      expect(queryLink()).toBeInTheDocument();
    });

    it('opens the modal when clicked', async () => {
      mockIdMethods = { data: [buildMethod()] };
      render(<Trigger />);
      expect(modalOpened).toBe(false);

      await userEvent.click(queryLink()!);

      expect(modalOpened).toBe(true);
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
