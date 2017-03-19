// import React from 'react';
// import { shallow } from 'enzyme';

// import SubmitIdeaForm from '../index';

describe('<$COMPONENT$ />', () => {
  describe('required props', () => {
    const expectedProps = ['className', 'storeDraftCopy', 'loadExistingDraft'];
    const testProp = (prop) => {
      expect(prop).toEqual(prop);
      // TODO
    };

    for (let i = 0; i < expectedProps.length; i += 1) {
      it(`should receive ${expectedProps[i]} not null`, () => {
        testProp(expectedProps[i]);
      });
    }
  });
});
