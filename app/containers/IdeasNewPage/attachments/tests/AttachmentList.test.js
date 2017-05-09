import React from 'react';
import { shallow } from 'enzyme';
import { matcher, serializer } from 'jest-styled-components';
import { mountWithIntl } from 'utils/testing/intl';

import AttachmentList, { Attachments, StyledFileInput } from '../AttachmentList';

expect.extend(matcher);
expect.addSnapshotSerializer(serializer);

describe('<AttachmentList />', () => {
  const attachments = ['1', '2'];
  const jestFn = jest.fn();
  it('should receive attachments prop', () => {
    const wrapper = shallow(
      <AttachmentList
        loadAttachments={jestFn}
        storeAttachment={jestFn}
        attachments={attachments}
        storeAttachmentError={false}
        loadAttachmentsError={false}
      />
    );

    expect(wrapper.prop('attachments')).toEqual(attachments);
  });

  it('should render the right number of attachments', () => {
    const wrapper = mountWithIntl(
      <Attachments attachments={attachments} />
    );
    expect(wrapper.find('Attachment')).toHaveLength(2);
  });

  it('input button should render with the correct styles', () => {
    const wrapper = shallow(
      <StyledFileInput onFileUpload={jestFn} />
    );
    expect(wrapper).toMatchStyledComponentsSnapshot();
  });
});
