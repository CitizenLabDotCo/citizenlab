import React from 'react';
import NewAuthModal from '.';
import { render, screen, act, waitFor, fireEvent } from 'utils/testUtils/rtl';

// events
import { triggerAuthenticationFlow } from './events';

// mock server
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { projectResponse as defaultProjectRequirementsResponse } from 'api/authentication_requirements/__mocks__/getAuthenticationRequirements';

const projectRequirementsPath =
  '*projects/123/permissions/posting_idea/requirements';

let projectRequirementsResponse;

const projectRequirementsResponseEmailSatisfied = JSON.parse(
  JSON.stringify(defaultProjectRequirementsResponse)
);
projectRequirementsResponseEmailSatisfied.data.attributes.requirements.requirements.built_in.email =
  'satisfied';

const server = setupServer(
  rest.get(projectRequirementsPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(projectRequirementsResponse));
  }),
  rest.post('*/users', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
  rest.post('*/user_token', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ jwt: 'bla' }));
  }),
  rest.post('*/user/confirm', async (req, res, ctx) => {
    const json = await req.json();

    if (json.confirmation.code === '1234') {
      return res(ctx.status(200), ctx.json({}));
    }

    return res(
      ctx.status(422),
      ctx.json({ errors: { code: [{ error: 'invalid' }] } })
    );
  }),
  rest.get('*/users/me', (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ data: { attributes: { email: 'test2@test2.com' } } })
    );
  })
);

describe('<NewAuthModal />', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('renders', () => {
    render(<NewAuthModal />);
  });

  describe('requirements: only email and password', () => {
    it('works correctly when completing whole flow at once', async () => {
      projectRequirementsResponse = defaultProjectRequirementsResponse;

      render(<NewAuthModal />);
      expect(screen.queryByText('Email')).not.toBeInTheDocument();

      act(() => {
        triggerAuthenticationFlow({
          context: {
            type: 'project',
            id: '123',
            action: 'posting_idea',
          },
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Email')).toBeInTheDocument();
      });

      act(() => {
        fireEvent.input(screen.getByLabelText('Email'), {
          target: {
            value: 'test@test.com',
          },
        });
      });

      act(() => {
        fireEvent.click(screen.getByText('Continue'));
      });

      await waitFor(() => {
        expect(
          screen.getByText(/An email with a confirmation code has been sent to/)
        ).toBeInTheDocument();
        expect(screen.getByText('test@test.com')).toBeInTheDocument();
      });

      act(() => {
        fireEvent.input(screen.getByLabelText('Code'), {
          target: {
            value: '1234',
          },
        });
      });

      act(() => {
        fireEvent.click(screen.getByText(/Verify and Continue/));
      });

      await waitFor(() => {
        expect(screen.getByText(/All done/)).toBeInTheDocument();
      });
    });

    it('goes straight to confirmation when email was already provided before', async () => {
      projectRequirementsResponse = projectRequirementsResponseEmailSatisfied;

      render(<NewAuthModal />);
      act(() => {
        triggerAuthenticationFlow({
          context: {
            type: 'project',
            id: '123',
            action: 'posting_idea',
          },
        });
      });

      await waitFor(() => {
        expect(
          screen.getByText(/An email with a confirmation code has been sent to/)
        ).toBeInTheDocument();
        expect(screen.getByText('test2@test2.com')).toBeInTheDocument();
      });
    });

    it('shows correct error message when entering wrong code', async () => {
      projectRequirementsResponse = projectRequirementsResponseEmailSatisfied;

      render(<NewAuthModal />);
      act(() => {
        triggerAuthenticationFlow({
          context: {
            type: 'project',
            id: '123',
            action: 'posting_idea',
          },
        });
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Code')).toBeInTheDocument();
      });

      act(() => {
        fireEvent.input(screen.getByLabelText('Code'), {
          target: {
            value: '0000',
          },
        });
      });

      act(() => {
        fireEvent.click(screen.getByText(/Verify and Continue/));
      });

      await waitFor(() => {
        expect(screen.getByText(/Please check your email/)).toBeInTheDocument();
      });
    });
  });
});
