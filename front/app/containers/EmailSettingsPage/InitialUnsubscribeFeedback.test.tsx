// @ts-nocheck
import React from 'react';
import { shallow } from 'enzyme';

import InitialUnsubscribeFeedback from './InitialUnsubscribeFeedback';

const checkMessageId = (Comp, test) =>
  Comp.find('FormattedMessage').prop('id').includes(test);

describe('<InitialUnsubscribeFeedback/>', () => {
  describe('success', () => {
    it('has the right message', () => {
      const Wrapper = shallow(
        <InitialUnsubscribeFeedback
          status="success"
          unsubscribedCampaignMultiloc={{ en: 'That pesky email' }}
        />
      );
      expect(
        checkMessageId(
          Wrapper.find('InitialUnsubscribeFeedback__Message'),
          'initialUnsubscribeSuccess'
        )
      ).toBe(true);
    });
  });
  describe('error', () => {
    it('has the right message', () => {
      const Wrapper = shallow(<InitialUnsubscribeFeedback status="error" />);
      expect(
        checkMessageId(
          Wrapper.find('InitialUnsubscribeFeedback__Message'),
          'initialUnsubscribeError'
        )
      ).toBe(true);
    });
  });
  describe('loading', () => {
    it('has the right message', () => {
      const Wrapper = shallow(<InitialUnsubscribeFeedback status="loading" />);
      expect(
        checkMessageId(
          Wrapper.find('InitialUnsubscribeFeedback__Message'),
          'initialUnsubscribeLoading'
        )
      ).toBe(true);
    });
  });
});
