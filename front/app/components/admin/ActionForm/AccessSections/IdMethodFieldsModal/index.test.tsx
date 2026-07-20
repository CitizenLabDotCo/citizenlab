import React from 'react';

import { Multiloc } from 'typings';

import { IdMethodData, MethodMetadata } from 'api/id_methods/types';

import { render, screen, userEvent, within } from 'utils/testUtils/rtl';

import IdMethodFieldsModal from '.';

// The modal reads every configured id method and shows the fields each of the
// *active* ones (authentication and/or verification) hands back.
let mockIdMethods: { data: IdMethodData[] } | undefined = { data: [] };

jest.mock('api/id_methods/useIdMethods', () =>
  jest.fn(() => ({ data: mockIdMethods }))
);

jest.mock('hooks/useLocalize', () =>
  jest.fn(() => (multiloc: Multiloc) => multiloc.en)
);

// The shared, human-readable names. Only covers part of the methods, so the
// modal has to fall back for the rest.
jest.mock('hooks/useAuthMethodNames', () => ({
  // Keep the real `getMethodName` — only the names themselves are stubbed.
  ...jest.requireActual('hooks/useAuthMethodNames'),
  __esModule: true,
  default: jest.fn(() => ({
    franceconnect: 'FranceConnect',
    acm: 'Itsme®',
    // Configured per tenant — empty when the tenant hasn't set one.
    keycloak: '',
  })),
}));

// Render the modal inline instead of through the portal, which isn't mounted
// yet on the first render pass in jsdom.
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (content: React.ReactNode) => content,
}));

const getElementById = document.getElementById.bind(document);
document.getElementById = (id: string, ...args: unknown[]) => {
  if (id === 'modal-portal') return true as any;
  return (getElementById as any)(id, ...args);
};

const buildMetadata = (
  overrides: Partial<MethodMetadata> = {}
): MethodMetadata => ({
  allowed_for_verified_actions: true,
  name: 'ItsMe',
  locked_attributes: [{ en: 'First name' }],
  other_attributes: [{ en: 'Phone number' }],
  locked_custom_fields: [{ en: 'Birthyear' }],
  other_custom_fields: [{ en: 'Neighbourhood' }],
  ...overrides,
});

const buildMethod = ({
  id = 'method-1',
  name = 'fake_sso',
  authentication = false,
  verification = true,
  metadata = buildMetadata(),
}: {
  id?: string;
  name?: string;
  authentication?: boolean;
  verification?: boolean;
  // `null` models a method that exposes no metadata at all.
  metadata?: MethodMetadata | null;
} = {}): IdMethodData =>
  ({
    id,
    type: 'id_method',
    attributes: {
      name,
      authentication_method: authentication,
      verification_method: verification,
      method_metadata: metadata ?? undefined,
    },
  } as IdMethodData);

const renderModal = () =>
  render(<IdMethodFieldsModal opened onClose={jest.fn()} />);

beforeEach(() => {
  mockIdMethods = { data: [] };
});

describe('<IdMethodFieldsModal />', () => {
  // What a method can be used for is shown per method, since a method can be an
  // authentication method, a verification method, or both at once.
  describe('method capabilities', () => {
    it('marks a verification-only method as verification, not authentication', () => {
      mockIdMethods = {
        data: [buildMethod({ authentication: false, verification: true })],
      };
      renderModal();

      expect(screen.getByText('Verification')).toBeInTheDocument();
      expect(screen.queryByText('Authentication')).toBeNull();
    });

    it('marks an authentication-only method as authentication, not verification', () => {
      mockIdMethods = {
        data: [buildMethod({ authentication: true, verification: false })],
      };
      renderModal();

      expect(screen.getByText('Authentication')).toBeInTheDocument();
      expect(screen.queryByText('Verification')).toBeNull();
    });

    it('marks a method that is both with both capabilities', () => {
      mockIdMethods = {
        data: [buildMethod({ authentication: true, verification: true })],
      };
      renderModal();

      expect(screen.getByText('Authentication')).toBeInTheDocument();
      expect(screen.getByText('Verification')).toBeInTheDocument();
    });

    it('explains identification and both terms it covers in a tooltip', async () => {
      mockIdMethods = { data: [buildMethod()] };
      renderModal();

      await userEvent.hover(screen.getByTestId('tooltip-icon-button'));

      expect(
        await screen.findByText(/is the umbrella term for both ways/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/participants can create an account and log in/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/prove a participant’s identity through an official/i)
      ).toBeInTheDocument();
    });
  });

  describe('with a single active method', () => {
    beforeEach(() => {
      mockIdMethods = { data: [buildMethod()] };
    });

    it('uses the generic header and names the method in the body', () => {
      renderModal();

      expect(screen.getByText('Identification methods')).toBeInTheDocument();
      expect(screen.getByText('ItsMe')).toBeInTheDocument();
    });

    it('lists every returned field, without accordions', () => {
      renderModal();

      expect(screen.getByText('First name')).toBeInTheDocument();
      expect(screen.getByText('Phone number')).toBeInTheDocument();
      expect(screen.getByText('Birthyear')).toBeInTheDocument();
      expect(screen.getByText('Neighbourhood')).toBeInTheDocument();

      // The single-method layout shows the fields directly, so there is
      // nothing to expand.
      expect(screen.queryByRole('button', { name: /ItsMe/ })).toBeNull();
    });

    it('marks fields as locked or editable', () => {
      renderModal();

      expect(screen.getAllByText('Locked')).toHaveLength(2);
      expect(screen.getAllByText('Editable')).toHaveLength(2);
    });

    it('shows a generic message when the method returns no fields', () => {
      mockIdMethods = {
        data: [
          buildMethod({
            metadata: buildMetadata({
              locked_attributes: [],
              other_attributes: [],
              locked_custom_fields: [],
              other_custom_fields: [],
            }),
          }),
        ],
      };
      renderModal();

      expect(
        screen.getByText('This method doesn’t return any fields.')
      ).toBeInTheDocument();
    });

    it('shows a generic message when the method has no metadata', () => {
      mockIdMethods = {
        data: [buildMethod({ metadata: null })],
      };
      renderModal();

      expect(
        screen.getByText('This method doesn’t return any fields.')
      ).toBeInTheDocument();
    });
  });

  describe('with multiple active methods', () => {
    beforeEach(() => {
      mockIdMethods = {
        data: [
          buildMethod({
            id: 'method-1',
            verification: true,
            metadata: buildMetadata({
              name: 'ItsMe',
              locked_attributes: [{ en: 'First name' }],
              other_attributes: [],
              locked_custom_fields: [],
              other_custom_fields: [],
            }),
          }),
          buildMethod({
            id: 'method-2',
            name: 'franceconnect',
            authentication: true,
            verification: false,
            metadata: buildMetadata({
              name: 'FranceConnect',
              locked_attributes: [],
              other_attributes: [{ en: 'Email' }],
              locked_custom_fields: [],
              other_custom_fields: [],
            }),
          }),
        ],
      };
    });

    it('uses the generic header', () => {
      renderModal();

      expect(screen.getByText('Identification methods')).toBeInTheDocument();
    });

    it('renders one accordion per active method', () => {
      renderModal();

      expect(screen.getByRole('button', { name: /ItsMe/ })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /FranceConnect/ })
      ).toBeInTheDocument();
    });

    it('shows the fields of a method once its accordion is expanded', async () => {
      renderModal();

      // Collapsed accordions keep their fields out of the DOM.
      expect(screen.queryByText('Email')).toBeNull();

      await userEvent.click(
        screen.getByRole('button', { name: /FranceConnect/ })
      );

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Editable')).toBeInTheDocument();
      // The other method's fields stay collapsed.
      expect(screen.queryByText('First name')).toBeNull();
    });

    it('shows a generic message inside an accordion of a method without fields', async () => {
      mockIdMethods = {
        data: [
          ...(mockIdMethods?.data ?? []),
          buildMethod({
            id: 'method-3',
            name: 'bogus',
            verification: true,
            metadata: buildMetadata({
              name: 'Bogus',
              locked_attributes: [],
              other_attributes: [],
              locked_custom_fields: [],
              other_custom_fields: [],
            }),
          }),
        ],
      };
      renderModal();

      await userEvent.click(screen.getByRole('button', { name: /Bogus/ }));

      expect(
        screen.getByText('This method doesn’t return any fields.')
      ).toBeInTheDocument();
    });

    it('scopes each accordion to the fields of its own method', async () => {
      renderModal();

      const itsMeButton = screen.getByRole('button', { name: /ItsMe/ });
      await userEvent.click(itsMeButton);

      // The accordion title button points at the region holding its fields.
      const regionId = itsMeButton.getAttribute('aria-controls') as string;
      const itsMeRegion = document.getElementById(regionId) as HTMLElement;

      expect(within(itsMeRegion).getByText('First name')).toBeInTheDocument();
      expect(within(itsMeRegion).queryByText('Email')).toBeNull();
    });
  });

  describe('method naming', () => {
    it('prefers the shared human-readable name over the one the method reports', () => {
      mockIdMethods = {
        data: [
          buildMethod({
            name: 'acm',
            metadata: buildMetadata({ name: 'ACM' }),
          }),
        ],
      };
      renderModal();

      expect(screen.getByText('Itsme®')).toBeInTheDocument();
    });

    it('falls back to the name the method reports', () => {
      mockIdMethods = {
        data: [
          buildMethod({
            name: 'fake_sso',
            metadata: buildMetadata({ name: 'Fake SSO' }),
          }),
        ],
      };
      renderModal();

      expect(screen.getByText('Fake SSO')).toBeInTheDocument();
    });

    it('falls back to the config name when neither name is set', () => {
      mockIdMethods = {
        // Keycloak's name is configured per tenant and empty here.
        data: [buildMethod({ name: 'keycloak', metadata: null })],
      };
      renderModal();

      expect(screen.getByText('keycloak')).toBeInTheDocument();
    });
  });

  describe('method filtering', () => {
    it('ignores methods that are neither authentication nor verification methods', () => {
      mockIdMethods = {
        data: [
          buildMethod({
            id: 'method-1',
            metadata: buildMetadata({ name: 'ItsMe' }),
          }),
          buildMethod({
            id: 'method-2',
            name: 'bogus',
            authentication: false,
            verification: false,
            metadata: buildMetadata({ name: 'Bogus' }),
          }),
        ],
      };
      renderModal();

      // Only one method is active, so we get the single-method layout.
      expect(screen.getByText('ItsMe')).toBeInTheDocument();
      expect(screen.queryByText(/Bogus/)).toBeNull();
    });

    it('counts a method that is both an authentication and a verification method once', () => {
      mockIdMethods = {
        data: [
          buildMethod({
            authentication: true,
            verification: true,
            metadata: buildMetadata({ name: 'ItsMe' }),
          }),
        ],
      };
      renderModal();

      expect(screen.getByText('ItsMe')).toBeInTheDocument();
    });
  });

  describe('without any active method', () => {
    it('shows a generic message', () => {
      mockIdMethods = { data: [] };
      renderModal();

      expect(
        screen.getByText('No identification methods are currently active.')
      ).toBeInTheDocument();
    });

    it('shows a generic message while the methods are still loading', () => {
      mockIdMethods = undefined;
      renderModal();

      expect(
        screen.getByText('No identification methods are currently active.')
      ).toBeInTheDocument();
    });
  });
});
