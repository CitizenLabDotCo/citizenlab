import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';

// component to test
import { AdminProjectsProjectIndex } from '.';

// mock data and functions to replace the HoCs
import {
  mockPhaseIdeationData,
  mockPhaseSurveyTypeformData,
  mockPhaseSurveyGoogleFormData,
  mockPhaseInformationData,
} from 'services/__mocks__/phases';
import { getProject } from 'services/__mocks__/projects';
import { shallowWithIntl } from 'utils/testUtils/withIntl';
import { localizeProps } from 'utils/testUtils/localizeProps';
import { getDummyIntlObject } from 'utils/testUtils/mockedIntl';
import { WithRouterProps } from 'utils/cl-router/withRouter';

// what needs to be mocked by jest to render the component
jest.mock('utils/cl-intl');

jest.mock('utils/cl-router/Link');
jest.mock('hooks/useLocale');
jest.mock('services/locale');

const getRouterProps = (projectId, tabName?: string) =>
  ({
    location: {
      pathname: `/admin/projects/${projectId}/${tabName}`,
    },
    params: {
      projectId,
    },
  } as any as WithRouterProps);

const children = () => <div />;

const additionalProps = {
  previousPathName: 'www.gobackurl.com',
};

describe('<AdminProjectEdition />', () => {
  const intl = getDummyIntlObject();

  it('renders the correct set of tabs for a continuous information project', async () => {
    const surveys_enabled = true;
    const typeform_enabled = true;
    const phases = [];
    const project = getProject(
      'continuousInformation',
      'continuous',
      'information'
    );
    const routerProps = getRouterProps('continuousInformation');

    render(
      <AdminProjectsProjectIndex
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        project={project}
        intl={intl}
        {...routerProps}
        {...localizeProps}
        {...additionalProps}
      >
        {children}
      </AdminProjectsProjectIndex>
    );

    const tabNames = ['General', 'Description', 'Events'];
    tabNames.forEach((tabName) => {
      expect(screen.getByText(tabName)).toBeInTheDocument();
    });
  });

  it('renders the correct set of tabs for a continuous typeform survey project', async () => {
    const surveys_enabled = true;
    const typeform_enabled = true;

    const phases = [];
    const project = getProject(
      'continuousTypeform',
      'continuous',
      'survey',
      'typeform'
    );
    const routerProps = getRouterProps('continuousTypeform');

    render(
      <AdminProjectsProjectIndex
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        project={project}
        intl={intl}
        {...routerProps}
        {...localizeProps}
        {...additionalProps}
      >
        {children}
      </AdminProjectsProjectIndex>
    );

    const tabNames = ['General', 'Description', 'Survey Results', 'Events'];
    tabNames.forEach((tabName) => {
      expect(screen.getByText(tabName)).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('resource-single-tab')).toHaveLength(
      tabNames.length
    );
  });

  it('renders the correct set of tabs for a continuous non-typeform survey project', async () => {
    const surveys_enabled = true;
    const typeform_enabled = true;

    const phases = [];
    const project = getProject(
      'continuousGoogleForm',
      'continuous',
      'survey',
      'google_forms'
    );
    const routerProps = getRouterProps('continuousGoogleForm');

    render(
      <AdminProjectsProjectIndex
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        project={project}
        intl={intl}
        {...routerProps}
        {...localizeProps}
        {...additionalProps}
      >
        {children}
      </AdminProjectsProjectIndex>
    );

    const tabNames = ['General', 'Description', 'Events'];
    tabNames.forEach((tabName) => {
      expect(screen.getByText(tabName)).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('resource-single-tab')).toHaveLength(
      tabNames.length
    );
  });

  it('renders the correct set of tabs for a continuous typeform survey project if surveys are disabled', async () => {
    const surveys_enabled = false;
    const typeform_enabled = true;

    const phases = [];
    const project = getProject(
      'continuousTypeform',
      'continuous',
      'survey',
      'typeform'
    );
    const routerProps = getRouterProps('continuousTypeform');

    render(
      <AdminProjectsProjectIndex
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        project={project}
        intl={intl}
        {...routerProps}
        {...localizeProps}
        {...additionalProps}
      >
        {children}
      </AdminProjectsProjectIndex>
    );

    const tabNames = ['General', 'Description', 'Events'];
    tabNames.forEach((tabName) => {
      expect(screen.getByText(tabName)).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('resource-single-tab')).toHaveLength(
      tabNames.length
    );
  });

  it('renders the correct set of tabs for a continuous typeform survey project if typeform is disabled', async () => {
    const surveys_enabled = true;
    const typeform_enabled = false;

    const phases = [];
    const project = getProject(
      'continuousTypeform',
      'continuous',
      'survey',
      'typeform'
    );
    const routerProps = getRouterProps('continuousTypeform');

    render(
      <AdminProjectsProjectIndex
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        project={project}
        intl={intl}
        {...routerProps}
        {...localizeProps}
        {...additionalProps}
      >
        {children}
      </AdminProjectsProjectIndex>
    );

    const tabNames = ['General', 'Description', 'Events'];
    tabNames.forEach((tabName) => {
      expect(screen.getByText(tabName)).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('resource-single-tab')).toHaveLength(
      tabNames.length
    );
  });

  it('renders the correct set of tabs for a timeline project with a single information phase', async () => {
    const surveys_enabled = true;
    const typeform_enabled = true;

    const project = getProject('timelineInformation', 'timeline');
    const phases = [mockPhaseInformationData, mockPhaseInformationData];
    const routerProps = getRouterProps('timelineInformation');

    render(
      <AdminProjectsProjectIndex
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        project={project}
        intl={intl}
        {...routerProps}
        {...localizeProps}
        {...additionalProps}
      >
        {children}
      </AdminProjectsProjectIndex>
    );

    const tabNames = ['General', 'Description', 'Timeline', 'Events'];
    tabNames.forEach((tabName) => {
      expect(screen.getByText(tabName)).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('resource-single-tab')).toHaveLength(
      tabNames.length
    );
  });

  it('renders the correct set of tabs for a timeline project with an ideation phase', async () => {
    const surveys_enabled = true;
    const typeform_enabled = true;

    const project = getProject('timelineIdeation', 'timeline');
    const phases = [mockPhaseIdeationData, mockPhaseIdeationData];
    const routerProps = getRouterProps('timelineIdeation');

    render(
      <AdminProjectsProjectIndex
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        project={project}
        intl={intl}
        {...routerProps}
        {...localizeProps}
        {...additionalProps}
      >
        {children}
      </AdminProjectsProjectIndex>
    );

    const tabNames = [
      'General',
      'Description',
      'Input manager',
      'Allowed input tags',
      'Timeline',
      'Events',
    ];
    tabNames.forEach((tabName) => {
      expect(screen.getByText(tabName)).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('resource-single-tab')).toHaveLength(
      tabNames.length
    );
  });

  it('renders the correct set of tabs for a timeline project with a typeform survey phase', async () => {
    const surveys_enabled = true;
    const typeform_enabled = true;

    const project = getProject('timelineIdeation', 'timeline');
    const phases = [mockPhaseInformationData, mockPhaseSurveyTypeformData];
    const routerProps = getRouterProps('timelineIdeation');

    render(
      <AdminProjectsProjectIndex
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        project={project}
        intl={intl}
        {...routerProps}
        {...localizeProps}
        {...additionalProps}
      >
        {children}
      </AdminProjectsProjectIndex>
    );

    const tabNames = [
      'General',
      'Description',
      'Survey Results',
      'Timeline',
      'Events',
    ];
    tabNames.forEach((tabName) => {
      expect(screen.getByText(tabName)).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('resource-single-tab')).toHaveLength(
      tabNames.length
    );
  });

  // this one seems to oscillate between 5 and 7 tabs...
  it('renders the correct set of tabs for a timeline project with a googleform survey phase', async () => {
    const surveys_enabled = true;
    const typeform_enabled = true;

    const project = getProject('timelineIdeation', 'timeline');
    const phases = [mockPhaseInformationData, mockPhaseSurveyGoogleFormData];
    const routerProps = getRouterProps('timelineIdeation');

    render(
      <AdminProjectsProjectIndex
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        project={project}
        intl={intl}
        {...routerProps}
        {...localizeProps}
        {...additionalProps}
      >
        {children}
      </AdminProjectsProjectIndex>
    );

    const tabNames = ['General', 'Description', 'Timeline', 'Events'];
    tabNames.forEach((tabName) => {
      expect(screen.getByText(tabName)).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('resource-single-tab')).toHaveLength(
      tabNames.length
    );
  });

  it('lets you see the button to view the project', async () => {
    const surveys_enabled = true;
    const typeform_enabled = true;

    const phases = [];
    const project = getProject('whatever', 'timeline', 'poll');
    const routerProps = getRouterProps('continuousInformation');

    render(
      <AdminProjectsProjectIndex
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        project={project}
        intl={intl}
        {...routerProps}
        {...localizeProps}
        {...additionalProps}
      >
        {children}
      </AdminProjectsProjectIndex>
    );
    const viewProjectButton = await screen.findByText('View project');
    expect(viewProjectButton).toBeInTheDocument();
  });

  it('lets you view the button to add a new idea when appropriate', async () => {
    const surveys_enabled = true;
    const typeform_enabled = true;

    const phases = [];
    const project = getProject('continuousIdeation', 'continuous', 'ideation');
    const routerProps = getRouterProps('continuousIdeation', 'ideas');

    render(
      <AdminProjectsProjectIndex
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        project={project}
        intl={intl}
        {...routerProps}
        {...localizeProps}
        {...additionalProps}
      >
        {children}
      </AdminProjectsProjectIndex>
    );

    const newIdeaButton = await screen.findByText('Add an idea');
    expect(newIdeaButton).toBeInTheDocument();
  });

  it("doesn't let you add an idea when there's no ideation phase", async () => {
    const surveys_enabled = true;
    const typeform_enabled = true;

    const phases = [];
    const project = getProject(
      'continuousInformation',
      'continuous',
      'information'
    );
    const routerProps = getRouterProps('continuousInformation', 'general');

    shallowWithIntl(
      <AdminProjectsProjectIndex
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        project={project}
        intl={intl}
        {...routerProps}
        {...localizeProps}
        {...additionalProps}
      >
        {children}
      </AdminProjectsProjectIndex>
    );

    const newIdeaButton = await screen.queryByText('Add an idea');
    expect(newIdeaButton).toBeNull();
  });
});
