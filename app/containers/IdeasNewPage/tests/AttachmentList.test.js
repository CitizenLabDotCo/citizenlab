import React from 'react';
import { mount } from 'enzyme';
import AttachmentList, { Attachments } from '../AttachmentList';
import { mountWithIntl } from '../../../utils/intlTest';

// import Attachment from '../index';

describe('<AttachmentList />', () => {
  const attachments = ['1', '2'];
  const jestFn = jest.fn();
  it('should receive attachments prop', () => {
    const wrapper = mountWithIntl(
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
    const wrapper = mount(
      <Attachments attachments={attachments} />
    );
    expect(wrapper.find('Attachment')).toHaveLength(2);
  });
});
