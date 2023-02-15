import { getTemplateData } from './getTemplateData';

describe('getTemplateData', () => {
  it('works for timeline projects with ideation phase', () => {
    const project: any = {
      attributes: {
        process_type: 'timeline',
      },
    };

    const phases: any = [
      { id: '1', attributes: { participation_method: 'information' } },
      { id: '2', attributes: { participation_method: 'ideation' } },
    ];

    const expectedOutput = {
      participationMethod: 'ideation',
      phaseId: '2',
    };

    expect(getTemplateData(project, phases)).toEqual(expectedOutput);
  });

  it('works for timeline projects with native_survey phase', () => {
    const project: any = {
      attributes: {
        process_type: 'timeline',
      },
    };

    const phases: any = [
      { id: '1', attributes: { participation_method: 'information' } },
      { id: '2', attributes: { participation_method: 'native_survey' } },
    ];

    const expectedOutput = {
      participationMethod: 'native_survey',
      phaseId: '2',
    };

    expect(getTemplateData(project, phases)).toEqual(expectedOutput);
  });
});
