import { IdMethodData } from './types';
import { isOnlyShownForVerification } from './utils';

const baseAttributes = {
  authentication_method: true,
  verification_method: true,
};

describe('isOnlyShownForVerification', () => {
  it('is true for NemLog-in and Criipto when the setting is on', () => {
    const nemlogIn: IdMethodData = {
      id: 'nemlog_in',
      type: 'id_method',
      attributes: {
        ...baseAttributes,
        name: 'nemlog_in',
        only_show_for_verification: true,
      },
    };
    const criipto: IdMethodData = {
      id: 'criipto',
      type: 'id_method',
      attributes: {
        ...baseAttributes,
        name: 'criipto',
        ui_method_name: 'MitID',
        only_show_for_verification: true,
      },
    };

    expect(isOnlyShownForVerification(nemlogIn)).toBe(true);
    expect(isOnlyShownForVerification(criipto)).toBe(true);
  });

  it('is false when the setting is missing', () => {
    const nemlogIn: IdMethodData = {
      id: 'nemlog_in',
      type: 'id_method',
      attributes: { ...baseAttributes, name: 'nemlog_in' },
    };

    expect(isOnlyShownForVerification(nemlogIn)).toBe(false);
  });

  it('is false for other methods', () => {
    const google: IdMethodData = {
      id: 'google',
      type: 'id_method',
      attributes: { ...baseAttributes, name: 'google' },
    };

    expect(isOnlyShownForVerification(google)).toBe(false);
  });
});
