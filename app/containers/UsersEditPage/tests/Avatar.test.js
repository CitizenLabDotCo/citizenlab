import { shallow } from 'enzyme';

import { dropzoneImage } from '../Avatar';

describe('<Avatar />', () => {
  it('dropzoneImage should return the avatar', () => {
    const avatarBase64 = 'base64_string';

    expect(shallow(dropzoneImage(avatarBase64)).find('div')).toHaveLength(1);
  });
});
