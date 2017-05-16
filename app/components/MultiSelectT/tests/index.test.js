import { shallow } from 'enzyme';
import T from 'containers/T';

import { optionRendered } from '../index';

describe('<MultiSeelct />', () => {
  describe('optionRendered', () => {
    it('should render T component', () => {
      const label = '{}';
      const wrapper = shallow(optionRendered({ label }));
      expect(wrapper.find(T).length).toEqual(1);
    });
  });
});
