import React from 'react';
import { FormattedMessage } from 'react-intl';
import { createComponentWithIntl, mountWithIntl } from '../../../utils/intlTest';
import messages from '../messages';
import ProfileForm from '../ProfileForm';
import { mapDispatchToProps } from '../index';
import { updateCurrentUser } from '../actions';
import { localStorageMock } from '../../../utils/testUtils';
import { jestFn } from '../../../utils/testConstants';

describe('<ProfileForm />', () => {
  // mock localStorage
  Object.defineProperty(window, 'localStorage', { value: localStorageMock() });

  it('calls onSubmit handler', () => {
    const handleSubmitMock = jest.fn();
    const user = {};

    const wrapper = mountWithIntl(<ProfileForm
      onFormSubmit={handleSubmitMock}
      avatarUpload={jestFn}
      avatarUploadError={jestFn}
      onLocaleChangeClick={jestFn}
      userData={user}
    />);
    wrapper.find('[type="submit"]').get(0).click();
    expect(handleSubmitMock.mock.calls.length).toEqual(1);
  });

  describe('onFormSubmit', () => {
    it('updateCurrentUser action should be dispatched', () => {
      const dispatch = jest.fn();
      const result = mapDispatchToProps(dispatch);

      const payload = {
        userId: 'anything',
      };

      result.onProfileFormSubmit(payload);

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
