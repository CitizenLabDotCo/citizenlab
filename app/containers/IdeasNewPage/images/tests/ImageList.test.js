import React from 'react';
import { mount, shallow } from 'enzyme';
import { matcher, serializer } from 'jest-styled-components';

import ImageList, { Images, StyledFileInput } from '../ImageList';

expect.extend(matcher);
expect.addSnapshotSerializer(serializer);

xdescribe('<ImageList />', () => {
  const images = ['1', '2'];
  const jestFn = jest.fn();
  it('should receive images prop', () => {
    const wrapper = shallow(
      <ImageList
        loadImages={jestFn}
        storeImage={jestFn}
        images={images}
        storeImageError={false}
        loadImagesError={false}
      />
    );

    expect(wrapper.prop('images')).toEqual(images);
  });

  it('should render the right number of images', () => {
    const wrapper = mount(
      <Images images={images} />
    );
    // Images are wrapped so when we pass 2, we get 4
    expect(wrapper.find('Image')).toHaveLength(4);
  });

  it('input button should render with the correct styles', () => {
    const wrapper = shallow(
      <StyledFileInput onFileUpload={jestFn} />
    );
    expect(wrapper).toMatchStyledComponentsSnapshot();
  });
});
