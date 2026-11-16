import React from 'react';

import IconButton from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Actions/IconButton',
  component: IconButton,
  args: { icon: 'chevron-down-16', 'aria-label': 'Open' },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const sizes = [28, 24] as const;

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    {children}
  </div>
);

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(['default', 'strong'] as const).map((tone) =>
        sizes.map((size) => (
          <Row key={`ghost-${tone}-${size}`}>
            <IconButton
              icon="chevron-down-16"
              aria-label="Open"
              tone={tone}
              size={size}
            />
            <IconButton
              icon="chevron-down-16"
              aria-label="Open"
              tone={tone}
              size={size}
              isDisabled
            />
          </Row>
        ))
      )}
      {sizes.map((size) => (
        <Row key={`bordered-${size}`}>
          <IconButton
            icon="chevron-down-16"
            aria-label="Open"
            variant="bordered"
            size={size}
          />
          <IconButton
            icon="chevron-down-16"
            aria-label="Open"
            variant="bordered"
            size={size}
            isDisabled
          />
          <IconButton
            icon="chevron-down-16"
            aria-label="Filter"
            variant="bordered"
            size={size}
            isSelected
          />
          <IconButton
            icon="chevron-down-16"
            aria-label="Filter"
            variant="bordered"
            size={size}
            isSelected
            isDisabled
          />
        </Row>
      ))}
      {sizes.map((size) => (
        <Row key={`primary-${size}`}>
          <IconButton
            icon="chevron-down-16"
            aria-label="Send"
            variant="primary"
            size={size}
          />
          <IconButton
            icon="chevron-down-16"
            aria-label="Send"
            variant="primary"
            size={size}
            isDisabled
          />
          <IconButton
            icon="chevron-down-16"
            aria-label="Send"
            variant="primary"
            size={size}
            isPending
          />
        </Row>
      ))}
    </div>
  ),
};

const ToggleExample = () => {
  const [isSelected, setSelected] = React.useState(false);
  return (
    <IconButton
      icon="funnel-16"
      aria-label="Filter"
      variant="bordered"
      isSelected={isSelected}
      onChange={setSelected}
    />
  );
};

export const Toggle: Story = {
  render: () => <ToggleExample />,
};

// Looks disabled, stays focusable; hover or focus shows why. Pressing does nothing.
export const DisabledWithReason: Story = {
  render: () => (
    <Row>
      <IconButton
        icon="download-16"
        aria-label="Download"
        disabledReason="Nobody signed up yet"
        onPress={() => window.alert('pressed')}
      />
      <IconButton
        icon="funnel-16"
        aria-label="Filter"
        variant="bordered"
        isSelected={false}
        onChange={() => window.alert('toggled')}
        disabledReason="No filters for this view"
      />
    </Row>
  ),
};
