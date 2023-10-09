import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

// testing
import { userEvent, within, waitFor } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { el } from 'utils/storybook/interaction';

// mocking
import { rest } from 'msw';
import mockEndpoints, { EndpointMock } from 'utils/storybook/mockEndpoints';
import { mockAuthUserData } from 'api/me/__mocks__/_mockServer';
import { API_PATH } from 'containers/App/constants';
import {
  initiativeResponse,
  phaseResponse,
} from 'api/authentication/authentication_requirements/__mocks__/_mockServer';

// component
import Authentication from '.';
import { triggerAuthenticationFlow } from './events';

const noop = () => {};

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'Example/Authentication',
  render: (props) => {
    return (
      <>
        <button
          style={{
            backgroundColor: '#d3d3d3',
            padding: '12px',
            cursor: 'pointer',
          }}
          data-testid="open-modal-button"
          onClick={() => triggerAuthenticationFlow()}
        >
          Open auth modal
        </button>
        <Authentication {...props} />
      </>
    );
  },
  parameters: {
    layout: 'centered',
  },
  args: {
    setModalOpen: noop,
  },
} satisfies Meta<typeof Authentication>;

export default meta;
type Story = StoryObj<typeof meta>;

// mocks
const usersMeMock1: EndpointMock = (_req, res, ctx) => {
  return res(ctx.status(401));
};
const usersMeMock2: EndpointMock = (_req, res, ctx) => {
  return res(ctx.status(200), ctx.json({ data: mockAuthUserData }));
};
let usersMeMock = usersMeMock1;

const requirementsMock1: EndpointMock = (_req, res, ctx) => {
  return res(ctx.status(200), ctx.json(initiativeResponse));
};
const requirementsMock2: EndpointMock = (_req, res, ctx) => {
  return res(ctx.status(200), ctx.json(phaseResponse));
};
let requirementsMock = requirementsMock1;

export const SignUp: Story = {
  parameters: {
    msw: mockEndpoints({
      'GET users/me': rest.get(`${API_PATH}/users/me`, (req, res, ctx) =>
        usersMeMock(req, res, ctx)
      ),

      'GET permissions/visiting/requirements': rest.get(
        `${API_PATH}/permissions/visiting/requirements`,
        (req, res, ctx) => requirementsMock(req, res, ctx)
      ),
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('open-modal-button'));

    await waitFor(async () => {
      await expect(canvas.getByText('Sign up')).toBeInTheDocument();
    });

    await userEvent.type(
      el(canvasElement.querySelector('#firstName')),
      'Testy'
    );
    await userEvent.type(
      el(canvasElement.querySelector('#lastName')),
      'Testerson'
    );
    await userEvent.type(
      el(canvasElement.querySelector('#email')),
      'testy@testerson.com'
    );
    await userEvent.type(
      el(canvasElement.querySelector('#password')),
      'test-password'
    );

    const getCheckbox = (selector: string) =>
      el(
        el(canvasElement.querySelector(selector)).querySelector('.e2e-checkbox')
      );

    await userEvent.click(getCheckbox('#e2e-terms-conditions-container'));
    await userEvent.click(getCheckbox('#e2e-privacy-policy-container'));

    usersMeMock = usersMeMock2;
    requirementsMock = requirementsMock2;

    await userEvent.click(
      el(
        el(
          canvasElement.querySelector('#e2e-signup-password-submit-button')
        ).querySelector('button')
      )
    );
  },
};
