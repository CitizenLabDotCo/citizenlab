import React from 'react';
import { mount } from 'enzyme';
import Avatar from '../Avatar';

describe('<Avatar />', () => {
  it('it should display the avatar when avatarURL is provided', () => {
    const avatarURL = 'path_to_image/image.png';
    const wrapper = mount(<Avatar avatarURL={avatarURL} />);
    expect(wrapper.find('Image').length).toEqual(1);
  });
});
