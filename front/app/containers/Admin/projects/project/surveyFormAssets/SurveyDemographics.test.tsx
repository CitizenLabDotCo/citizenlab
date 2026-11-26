import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import SurveyDemographics from './SurveyDemographics';

jest.mock('hooks/useProjectBackofficeRedesign', () => () => true);

jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useParams: () => ({ projectId: 'project-id', phaseId: 'phase-id' }),
}));

jest.mock(
  'containers/Admin/projects/project/backofficeRedesign/Phase/BuildPanel/BuildFields/MethodSection/DemographicsCard',
  () => () => <p>Demographic questions</p>
);

let mockInForm = false;
jest.mock('api/phase_permissions/usePhasePermissions', () => () => ({
  data: {
    data: [
      {
        attributes: {
          action: 'posting_idea',
          user_fields_in_form_descriptor: { value: mockInForm },
        },
      },
    ],
  },
}));

describe('SurveyDemographics', () => {
  it('shows the demographic questions when they are part of the form', () => {
    mockInForm = true;
    render(<SurveyDemographics />);

    expect(screen.getByText('Demographic questions')).toBeInTheDocument();
  });

  it('leaves them out when they are asked before taking part', () => {
    mockInForm = false;
    render(<SurveyDemographics />);

    expect(screen.queryByText('Demographic questions')).not.toBeInTheDocument();
  });
});
