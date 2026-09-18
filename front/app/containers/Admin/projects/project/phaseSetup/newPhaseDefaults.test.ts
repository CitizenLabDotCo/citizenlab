import { getNewPhaseDefaults } from './newPhaseDefaults';

const formatMessageWithLocale = (locale: string) => `text-${locale}`;

describe('getNewPhaseDefaults', () => {
  it('uses the defaults of the picked method on the timeline', () => {
    const defaults = getNewPhaseDefaults({
      participationMethod: 'voting',
      standalone: false,
      tenantLocales: ['en'],
      formatMessageWithLocale,
    });

    expect(defaults.participation_method).toBe('voting');
    expect(defaults.voting_method).toBe('single_voting');
    expect(defaults.placement_type).toBeUndefined();
    expect(defaults.native_survey_title_multiloc).toBeUndefined();
  });

  it('fills in the survey title and button for native surveys', () => {
    const defaults = getNewPhaseDefaults({
      participationMethod: 'native_survey',
      standalone: false,
      tenantLocales: ['en', 'nl-BE'],
      formatMessageWithLocale,
    });

    expect(defaults.native_survey_title_multiloc).toEqual({
      en: 'text-en',
      'nl-BE': 'text-nl-BE',
    });
    expect(defaults.native_survey_button_multiloc).toEqual({
      en: 'text-en',
      'nl-BE': 'text-nl-BE',
    });
  });

  it('places spotlight surveys outside the timeline', () => {
    const defaults = getNewPhaseDefaults({
      participationMethod: 'native_survey',
      standalone: true,
      tenantLocales: ['en'],
      formatMessageWithLocale,
    });

    expect(defaults.placement_type).toBe('standalone');
    expect(defaults.allow_multiple_responses).toBe(false);
  });
});
