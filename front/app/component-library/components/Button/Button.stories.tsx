import React from 'react';

import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';

import Button from '.';

export default {
  title: 'Components/Button',
  component: Button,
};

export const Primary = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Button
        buttonStyle="primary"
        disabled={boolean('Disabled', false)}
        processing={boolean('Processing', false)}
        onClick={action('button clicked')}
      >
        Button
      </Button>
    </div>
  ),

  name: 'primary',
};

export const PrimaryWithIcon = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Button
        buttonStyle="primary"
        icon="info-outline"
        disabled={boolean('Disabled', false)}
        processing={boolean('Processing', false)}
        onClick={action('button clicked')}
      >
        Button
      </Button>
    </div>
  ),

  name: 'primary with icon',
};

export const PrimaryOutlined = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Button
        buttonStyle="primary-outlined"
        disabled={boolean('Disabled', false)}
        processing={boolean('Processing', false)}
        onClick={action('button clicked')}
      >
        Button
      </Button>
    </div>
  ),

  name: 'primary-outlined',
};

export const PrimaryInverse = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Button
        buttonStyle="primary-inverse"
        disabled={boolean('Disabled', false)}
        processing={boolean('Processing', false)}
        onClick={action('button clicked')}
      >
        Button
      </Button>
    </div>
  ),

  name: 'primary-inverse',
};

export const Secondary = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Button
        buttonStyle="secondary"
        disabled={boolean('Disabled', false)}
        processing={boolean('Processing', false)}
        onClick={action('button clicked')}
      >
        Button
      </Button>
    </div>
  ),

  name: 'secondary',
};

export const SecondaryOutlined = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Button
        buttonStyle="secondary-outlined"
        disabled={boolean('Disabled', false)}
        processing={boolean('Processing', false)}
        onClick={action('button clicked')}
      >
        Button
      </Button>
    </div>
  ),

  name: 'secondary-outlined',
};

export const Success = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Button
        buttonStyle="success"
        disabled={boolean('Disabled', false)}
        processing={boolean('Processing', false)}
        onClick={action('button clicked')}
      >
        Button
      </Button>
    </div>
  ),

  name: 'success',
};

export const TextStyle = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Button
        buttonStyle="text"
        disabled={boolean('Disabled', false)}
        processing={boolean('Processing', false)}
        onClick={action('button clicked')}
      >
        Button
      </Button>
    </div>
  ),

  name: 'text style',
};

export const ClBlue = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Button
        buttonStyle="cl-blue"
        disabled={boolean('Disabled', false)}
        processing={boolean('Processing', false)}
        onClick={action('button clicked')}
      >
        Button
      </Button>
    </div>
  ),

  name: 'cl-blue',
};

export const AdminDark = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Button
        buttonStyle="admin-dark"
        disabled={boolean('Disabled', false)}
        processing={boolean('Processing', false)}
        onClick={action('button clicked')}
      >
        Button
      </Button>
    </div>
  ),

  name: 'admin-dark',
};

export const AdminDarkText = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Button
        buttonStyle="admin-dark-text"
        disabled={boolean('Disabled', false)}
        processing={boolean('Processing', false)}
        onClick={action('button clicked')}
      >
        Button
      </Button>
    </div>
  ),

  name: 'admin-dark-text',
};

export const Delete = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Button
        buttonStyle="delete"
        disabled={boolean('Disabled', false)}
        processing={boolean('Processing', false)}
        onClick={action('button clicked')}
      >
        Button
      </Button>
    </div>
  ),

  name: 'delete',
};

export const White = {
  render: () => (
    <div
      style={{
        display: 'flex',
        background: '#f4f4f4',
        padding: '10px',
      }}
    >
      <Button
        buttonStyle="white"
        disabled={boolean('Disabled', false)}
        processing={boolean('Processing', false)}
        onClick={action('button clicked')}
      >
        Button
      </Button>
    </div>
  ),

  name: 'white',
};

export const ButtonLink = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Button
        buttonStyle="primary"
        disabled={boolean('Disabled', false)}
        processing={boolean('Processing', false)}
        as={(props) => {
          return (
            <a {...props} href="https://citizenlab.co/">
              {props.children}
            </a>
          );
        }}
      >
        Button that is actually a link
      </Button>
    </div>
  ),

  name: 'button-link',
};
