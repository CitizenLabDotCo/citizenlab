import React from 'react';
import { WithRouterProps } from 'react-router';
import { Multiloc } from 'typings';
import { render, screen } from 'utils/testUtils/rtl';
import ContentBuilderToggle from './ContentBuilderToggle';

jest.mock('services/appConfiguration');
jest.mock('utils/cl-router/history');
jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));
jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));

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
const multiloc = 'en' as Multiloc;

describe('ContentBuilderToggle', () => {
  it('Confirm link shown appropriately when builder option toggled', () => {
    render(
      <ContentBuilderToggle
        valueMultiloc={multiloc}
        onChange={dummyFunction}
        label={'QuillLabel'}
        labelTooltipText={'LabelTooltipText'}
        toggleLabel={'ToggleLabel'}
        toggleTooltipText={'ToggleTooltipText'}
        linkText={'LinkText'}
        onMount={dummyFunction}
        {...routerProps}
      />
    );
    const toggle = screen.getByRole('checkbox');
    expect(screen.queryByText('LinkText')).not.toBeInTheDocument();
    toggle.click();
    expect(screen.queryByText('LinkText')).toBeInTheDocument();
  });
  it('Confirm Quill editor shown appropriately when builder option toggled', () => {
    render(
      <ContentBuilderToggle
        valueMultiloc={multiloc}
        onChange={dummyFunction}
        label={'QuillLabel'}
        labelTooltipText={'LabelTooltipText'}
        toggleLabel={'ToggleLabel'}
        toggleTooltipText={'ToggleTooltipText'}
        linkText={'LinkText'}
        onMount={dummyFunction}
        {...routerProps}
      />
    );
    const toggle = screen.getByRole('checkbox');
    expect(screen.queryByText('QuillLabel')).toBeInTheDocument();
    toggle.click();
    expect(screen.queryByText('QuillLabel')).not.toBeInTheDocument();
  });
});
