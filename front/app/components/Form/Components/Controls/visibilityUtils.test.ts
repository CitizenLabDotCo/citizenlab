import { RuleEffect } from '@jsonforms/core';

import { customAjv } from 'components/Form/utils';

import { ExtendedUISchema, isVisible } from './visibilityUtils';

describe('isVisible', () => {
  it('should return true if no ruleArray is given', () => {
    const uischema: ExtendedUISchema = {
      type: 'Control',
      scope: '#/properties/foo',
    };
    expect(isVisible(uischema, {}, '', customAjv)).toBe(true);
  });

  it('should return true if ruleArray is empty', () => {
    const uischema = {
      type: 'Control',
      scope: '#/properties/foo',
      ruleArray: [],
    };
    expect(isVisible(uischema, {}, '', customAjv)).toBe(true);
  });

  it('should return true if ruleArray is fulfilled', () => {
    const uischema: ExtendedUISchema = {
      type: 'Control',
      scope: '#/properties/foo',
      ruleArray: [
        {
          effect: RuleEffect.SHOW,
          condition: {
            scope: '#/properties/foo',
            schema: {
              enum: ['bar'],
            },
          },
        },
      ],
    };
    expect(isVisible(uischema, { foo: 'bar' }, '', customAjv)).toBe(true);
  });

  it('should return false if ruleArray is not fulfilled', () => {
    const uischema: ExtendedUISchema = {
      type: 'Control',
      scope: '#/properties/foo',
      ruleArray: [
        {
          effect: RuleEffect.SHOW,
          condition: {
            scope: '#/properties/foo',
            schema: {
              enum: ['bar'],
            },
          },
        },
      ],
    };
    expect(isVisible(uischema, { foo: 'baz' }, '', customAjv)).toBe(false);
  });

  it('should return false if any of ruleArray is not fulfilled', () => {
    const uischema: ExtendedUISchema = {
      type: 'Control',
      scope: '#/properties/foo',
      ruleArray: [
        {
          effect: RuleEffect.SHOW,
          condition: {
            scope: '#/properties/foo',
            schema: {
              enum: ['bar'],
            },
          },
        },
        {
          effect: RuleEffect.SHOW,
          condition: {
            scope: '#/properties/foo',
            schema: {
              enum: ['baz'],
            },
          },
        },
      ],
    };
    expect(isVisible(uischema, { foo: 'baz' }, '', customAjv)).toBe(false);
  });
});
