import React from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import { createComponentWithIntl } from 'utils/testing/intl';

import messages from '../messages';
import { mapDispatchToProps } from '../index';
import { updateCurrentUser } from '../actions';

describe('<ProfileForm />', () => {
  describe('onFormSubmit', () => {
    it('updateCurrentUser action should be dispatched', () => {
      const dispatch = jest.fn();
      const result = mapDispatchToProps(dispatch);

      const payload = {
        userId: 'anything',
      };

      result.updateCurrentUser(payload);

      expect(dispatch).toHaveBeenCalledWith(updateCurrentUser(payload));
    });
  });

  describe('<LabelInputPair />', () => {
    it('input\'s label should render correctly', () => {
      const id = 'first_name';
      const tree = createComponentWithIntl(
        <label htmlFor={id}>
          <FormattedMessage {...messages[id]} />
        </label>
      ).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
