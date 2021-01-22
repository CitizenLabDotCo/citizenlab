// libraries
import React from 'react';

// component to test
// ! it is the component without the HoCs (data, localization...)
import { AdminProjectEdition } from './';

// mock data and functions to replace the HoCs
import { GetPhasesChildProps } from 'resources/GetPhases';
import {
  mockPhaseIdeationData,
  mockPhaseSurveyTypeformData,
  mockPhaseSurveyGoogleFormData,
  mockPhaseInformationData,
} from 'services/__mocks__/phases.ts';
import { getProject } from 'services/__mocks__/projects.ts';
import { shallowWithIntl } from 'utils/testUtils/withIntl';
import { localizeProps } from 'utils/testUtils/localizeProps';
import { WithRouterProps } from 'react-router';

// what needs to be mocked by jest to render the component
jest.mock('utils/cl-intl');

const getRouterProps = (projectId, tabName?: string) =>
  (({
    location: {
      pathname: `/admin/projects/${projectId}/${tabName}`,
    },
    params: {
      projectId,
    },
  } as any) as WithRouterProps);

const children = () => <div />;

describe('<AdminProjectEdition />', () => {
  it('renders the correct set of tabs for a continuous information project', () => {
    const surveys_enabled = true;
    const typeform_enabled = true;
    const granularPermissionsEnabled = true;
    const phases = [];
    const project = getProject(
      'continuousInformation',
      'continuous',
      'information'
    );
    const routerProps = getRouterProps('continuousInformation');

    // passing in mock data to replace the HoCs
    // ignore the error, shallowWithIntl method passes in the intl object
    const wrapper = shallowWithIntl(
      <AdminProjectEdition
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        granularPermissionsEnabled={granularPermissionsEnabled}
        phases={phases}
        project={project}
        children={children}
        {...routerProps}
        {...localizeProps}
      />
    );
    const tabs = wrapper.find('withRouter(TabbedResource)').props().tabs;

    expect(tabs.map((tab) => tab.url)).toMatchSnapshot();
  });

  it('renders the correct set of tabs for a continuous typeform survey project', () => {
    const surveys_enabled = true;
    const typeform_enabled = true;
    const granularPermissionsEnabled = true;

    const phases = [];
    const project = getProject(
      'continuousTypeform',
      'continuous',
      'survey',
      'typeform'
    );
    const routerProps = getRouterProps('continuousTypeform');

    // passing in mock data to replace the HoCs
    // ignore the error, shallowWithIntl method passes in the intl object
    const wrapper = shallowWithIntl(
      <AdminProjectEdition
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        granularPermissionsEnabled={granularPermissionsEnabled}
        phases={phases}
        project={project}
        children={children}
        {...routerProps}
        {...localizeProps}
      />
    );
    const tabs = wrapper.find('withRouter(TabbedResource)').props().tabs;

    expect(tabs.map((tab) => tab.url)).toMatchSnapshot();
  });

  it('renders the correct set of tabs for a continuous non-typeform survey project', () => {
    const surveys_enabled = true;
    const typeform_enabled = true;
    const granularPermissionsEnabled = true;

    const phases = [];
    const project = getProject(
      'continuousGoogleForm',
      'continuous',
      'survey',
      'google_forms'
    );
    const routerProps = getRouterProps('continuousGoogleForm');

    // passing in mock data to replace the HoCs
    // ignore the error, shallowWithIntl method passes in the intl object
    const wrapper = shallowWithIntl(
      <AdminProjectEdition
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        granularPermissionsEnabled={granularPermissionsEnabled}
        project={project}
        children={children}
        {...routerProps}
        {...localizeProps}
      />
    );
    const tabs = wrapper.find('withRouter(TabbedResource)').props().tabs;

    expect(tabs.map((tab) => tab.url)).toMatchSnapshot();
  });

  it('renders the correct set of tabs for a continuous typeform survey project if surveys are disabled', () => {
    const surveys_enabled = false;
    const typeform_enabled = true;
    const granularPermissionsEnabled = true;

    const phases = [];
    const project = getProject(
      'continuousTypeform',
      'continuous',
      'survey',
      'typeform'
    );
    const routerProps = getRouterProps('continuousTypeform');

    // passing in mock data to replace the HoCs
    // ignore the error, shallowWithIntl method passes in the intl object
    const wrapper = shallowWithIntl(
      <AdminProjectEdition
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        granularPermissionsEnabled={granularPermissionsEnabled}
        project={project}
        children={children}
        {...routerProps}
        {...localizeProps}
      />
    );
    const tabs = wrapper.find('withRouter(TabbedResource)').props().tabs;

    expect(tabs.map((tab) => tab.url)).toMatchSnapshot();
  });

  it('renders the correct set of tabs for a continuous typeform survey project if typeform is disabled', () => {
    const surveys_enabled = true;
    const typeform_enabled = false;
    const granularPermissionsEnabled = true;

    const phases = [];
    const project = getProject(
      'continuousTypeform',
      'continuous',
      'survey',
      'typeform'
    );
    const routerProps = getRouterProps('continuousTypeform');

    // passing in mock data to replace the HoCs
    // ignore the error, shallowWithIntl method passes in the intl object
    const wrapper = shallowWithIntl(
      <AdminProjectEdition
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        granularPermissionsEnabled={granularPermissionsEnabled}
        project={project}
        children={children}
        {...routerProps}
        {...localizeProps}
      />
    );
    const tabs = wrapper.find('withRouter(TabbedResource)').props().tabs;

    expect(tabs.map((tab) => tab.url)).toMatchSnapshot();
  });

  it('renders the correct set of tabs for a timeline project with a single information phase', () => {
    const surveys_enabled = true;
    const typeform_enabled = true;
    const granularPermissionsEnabled = true;

    const project = getProject('timelineInformation', 'timeline');
    const phases = [mockPhaseInformationData];
    const routerProps = getRouterProps('timelineInformation');
    // weirdly enough, project without ideation still have an ideas tab

    // passing in mock data to replace the HoCs
    // ignore the error, shallowWithIntl method passes in the intl object
    const wrapper = shallowWithIntl(
      <AdminProjectEdition
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        granularPermissionsEnabled={granularPermissionsEnabled}
        project={project}
        children={children}
        {...routerProps}
        {...localizeProps}
      />
    );
    const tabs = wrapper.find('withRouter(TabbedResource)').props().tabs;

    expect(tabs.map((tab) => tab.url)).toMatchSnapshot();
  });

  it('renders the correct set of tabs for a timeline project with an ideation phase', () => {
    const surveys_enabled = true;
    const typeform_enabled = true;
    const granularPermissionsEnabled = true;

    const project = getProject('timelineIdeation', 'timeline');
    const phases = [
      mockPhaseInformationData,
      mockPhaseIdeationData,
    ] as GetPhasesChildProps;
    const routerProps = getRouterProps('timelineIdeation');

    // passing in mock data to replace the HoCs
    // ignore the error, shallowWithIntl method passes in the intl object
    const wrapper = shallowWithIntl(
      <AdminProjectEdition
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        granularPermissionsEnabled={granularPermissionsEnabled}
        project={project}
        children={children}
        {...routerProps}
        {...localizeProps}
      />
    );
    const tabs = wrapper.find('withRouter(TabbedResource)').props().tabs;

    expect(tabs.map((tab) => tab.url)).toMatchSnapshot();
  });

  it('renders the correct set of tabs for a timeline project with a typeform survey phase', () => {
    const surveys_enabled = true;
    const typeform_enabled = true;
    const granularPermissionsEnabled = true;

    const project = getProject('timelineIdeation', 'timeline');
    const phases = [mockPhaseInformationData, mockPhaseSurveyTypeformData];
    const routerProps = getRouterProps('timelineIdeation');

    // passing in mock data to replace the HoCs
    // ignore the error, shallowWithIntl method passes in the intl object
    const wrapper = shallowWithIntl(
      <AdminProjectEdition
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        granularPermissionsEnabled={granularPermissionsEnabled}
        project={project}
        children={children}
        {...routerProps}
        {...localizeProps}
      />
    );
    const tabs = wrapper.find('withRouter(TabbedResource)').props().tabs;

    expect(tabs.map((tab) => tab.url)).toMatchSnapshot();
  });

  it('renders the correct set of tabs for a timeline project with a googleform survey phase', () => {
    const surveys_enabled = true;
    const typeform_enabled = true;
    const granularPermissionsEnabled = true;

    const project = getProject('timelineIdeation', 'timeline');
    const phases = [mockPhaseInformationData, mockPhaseSurveyGoogleFormData];
    const routerProps = getRouterProps('timelineIdeation');

    // passing in mock data to replace the HoCs
    // ignore the error, shallowWithIntl method passes in the intl object
    const wrapper = shallowWithIntl(
      <AdminProjectEdition
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        granularPermissionsEnabled={granularPermissionsEnabled}
        project={project}
        children={children}
        {...routerProps}
        {...localizeProps}
      />
    );
    const tabs = wrapper.find('withRouter(TabbedResource)').props().tabs;

    expect(tabs.map((tab) => tab.url)).toMatchSnapshot();
  });

  it('lets you see the project', () => {
    const surveys_enabled = true;
    const typeform_enabled = true;
    const granularPermissionsEnabled = true;

    const phases = [];
    const project = getProject(
      'continuousInformation',
      'continuous',
      'information'
    );
    const routerProps = getRouterProps('continuousInformation');

    // passing in mock data to replace the HoCs
    // ignore the error, shallowWithIntl method passes in the intl object
    const wrapper = shallowWithIntl(
      <AdminProjectEdition
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        granularPermissionsEnabled={granularPermissionsEnabled}
        project={project}
        children={children}
        {...routerProps}
        {...localizeProps}
      />
    );
    const linkPath = wrapper.find('#to-project').props().linkTo;

    expect(linkPath).toMatchSnapshot();
  });

  it('lets you add an idea when on the ideas tab', () => {
    const surveys_enabled = true;
    const typeform_enabled = true;
    const granularPermissionsEnabled = true;

    const phases = [];
    const project = getProject('continuousIdeation', 'continuous', 'ideation');
    const routerProps = getRouterProps('continuousIdeation', 'ideas');

    // passing in mock data to replace the HoCs
    // ignore the error, shallowWithIntl method passes in the intl object
    const wrapper = shallowWithIntl(
      <AdminProjectEdition
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        granularPermissionsEnabled={granularPermissionsEnabled}
        project={project}
        children={children}
        {...routerProps}
        {...localizeProps}
      />
    );
    const linkPath = wrapper.find('#e2e-new-idea').props().linkTo;

    expect(linkPath).toMatchSnapshot();
  });

  it("doesn't let you add an idea when there's no ideation phase", () => {
    const surveys_enabled = true;
    const typeform_enabled = true;
    const granularPermissionsEnabled = true;

    const phases = [];
    const project = getProject(
      'continuousInformation',
      'continuous',
      'information'
    );
    const routerProps = getRouterProps('continuousInformation', 'general');

    // passing in mock data to replace the HoCs
    // ignore the error, shallowWithIntl method passes in the intl object
    const wrapper = shallowWithIntl(
      <AdminProjectEdition
        surveys_enabled={surveys_enabled}
        typeform_enabled={typeform_enabled}
        phases={phases}
        granularPermissionsEnabled={granularPermissionsEnabled}
        project={project}
        children={children}
        {...routerProps}
        {...localizeProps}
      />
    );
    const linkPath = wrapper.find('#e2e-new-idea');

    expect(linkPath).toHaveLength(0);
  });
});
