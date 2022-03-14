import React from 'react';
import { WithRouterProps } from 'react-router';
import { render, screen } from 'utils/testUtils/rtl';
import ContentBuilderToggle from './ContentBuilderToggle';

jest.mock('services/locale');
jest.mock('services/avatars');
jest.mock('utils/cl-intl');
jest.mock('services/appConfiguration');
jest.mock('utils/cl-router/history');
jest.mock('components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher');
jest.mock('components/UI/QuillEditor');
jest.mock('components/UI/QuillEditedContent', () => 'QuillEditedContent');

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
    screen.debug();
    const toggle = screen.getByRole('checkbox');
    expect(screen.queryByText('LinkText')).not.toBeInTheDocument();
    toggle.click();
    expect(screen.queryByText('LinkText')).toBeInTheDocument();
  });
});
