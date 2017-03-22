import React from 'react';
import { FormattedMessage } from 'react-intl';
import { createComponentWithIntl, mountWithIntl } from '../../../utils/intlTest';
import messages from '../messages';
import ProfileForm from '../ProfileForm';
import { mapDispatchToProps } from '../index';
import { storeProfile } from '../actions';

describe('<ProfileForm />', () => {
  it('calls onSubmit handler', () => {
    const handleSubmitMock = jest.fn();
    const wrapper = mountWithIntl(<ProfileForm onFormSubmit={handleSubmitMock} />);
    wrapper.find('[type="submit"]').get(0).click();
    expect(handleSubmitMock.mock.calls.length).toEqual(1);
  });

  describe('onFormSubmit', () => {
    it('STORE_PROFILE action should be dispatched', () => {
      const dispatch = jest.fn();
      const result = mapDispatchToProps(dispatch);
      result.onProfileFormSubmit();
      expect(dispatch).toHaveBeenCalledWith(storeProfile());
    });
  });

  describe('<LabelInputPair />', () => {
    it('input\'s label should render correctly', () => {
      const id = 'firstName';
      const tree = createComponentWithIntl(
        <label htmlFor={id}>
          <FormattedMessage {...messages[id]} />
        </label>
      ).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
