import React from 'react';
import { Multiloc } from 'typings';
import { render, screen } from 'utils/testUtils/rtl';
import ContentBuilderToggle from './ContentBuilderToggle';

jest.mock('utils/cl-intl');
jest.mock('services/appConfiguration');
jest.mock('utils/cl-router/history');
jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));
jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));
jest.mock('react-router', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} />;
      };
    },
    Link: () => 'LinkText',
  };
});

const dummyFunction = jest.fn();
const multiloc = 'en' as Multiloc;

const routerProps = {
  location: {
    pathname: '/admin/projects/projectID/description',
  },
  params: {
    projectId: 'projectId',
  },
};

describe('ContentBuilderToggle', () => {
  it('Confirm link shown appropriately when builder option toggled', () => {
    render(
      <ContentBuilderToggle
        valueMultiloc={multiloc}
        onChange={dummyFunction}
        label={'QuillLabel'}
        labelTooltipText={'LabelTooltipText'}
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
