import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import ContentBuilderToggle from './contentBuilderToggle';
import { WithRouterProps } from 'react-router';

jest.mock('services/locale');
jest.mock('services/avatars');
jest.mock('utils/cl-intl');
jest.mock('services/appConfiguration');
jest.mock('utils/cl-router/history');
jest.mock('components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher');

const getRouterProps = (projectId) =>
  ({
    location: {
      pathname: '/admin/projects/projectID/description',
    },
    params: {
      projectId,
    },
  } as any as WithRouterProps);

const dummyFunction = () => {};

const routerProps = getRouterProps('projectID');

describe('ContentBuilderToggle', () => {
  it('Confirm link shown appropriately when builder option toggled', () => {
    render(
      <ContentBuilderToggle
        valueMultiloc={undefined}
        onChange={dummyFunction}
        label={'Label'}
        labelTooltipText={'LabelTooltipText'}
        toggleLabel={'ToggleLabel'}
        toggleTooltipText={'ToggleTooltipText'}
        linkText={'LinkText'}
        onMount={dummyFunction}
        {...routerProps}
      />
    );
    const toggle = screen.getByTestId('toggle');
    const link = screen.queryByText('LinkText');
    expect(link).not.toBeInTheDocument();
    toggle.click();
    expect(screen.getByTestId('builderLink')).toBeInTheDocument();
  });
});
