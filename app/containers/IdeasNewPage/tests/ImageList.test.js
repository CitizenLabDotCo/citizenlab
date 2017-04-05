import React from 'react';
import { mount, shallow } from 'enzyme';
import { matcher, serializer } from 'jest-styled-components';

import { mountWithIntl } from '../../../utils/intlTest';
import ImageList, { Images, StyledFileInput } from '../ImageList';

expect.extend(matcher);
expect.addSnapshotSerializer(serializer);

describe('<ImageList />', () => {
  const images = ['1', '2'];
  const jestFn = jest.fn();
  it('should receive images prop', () => {
    const wrapper = mountWithIntl(
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
    expect(wrapper.find('Image')).toHaveLength(2);
  });

  it('input button should render with the correct styles', () => {
    const wrapper = shallow(
      <StyledFileInput onFileUpload={jestFn} />
    );
    expect(wrapper).toMatchStyledComponentsSnapshot();
  });
});
