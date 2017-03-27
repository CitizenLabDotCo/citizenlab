import React from 'react';
import AttachmentList from '../AttachmentList';
import { mountWithIntl } from '../../../utils/intlTest';

// import Attachment from '../index';

describe('<AttachmentList />', () => {
  const attachments = ["1", "2"];
  const jestFn = jest.fn();
  const wrapper = mountWithIntl(
    <AttachmentList
      loadAttachments={jestFn}
      storeAttachment={jestFn}
      attachments={attachments}
      storeAttachmentError={false}
      loadAttachmentsError={false}
    />
  );

  it('should receive attachments prop', () => {
    expect(wrapper.prop('attachments')).toEqual(attachments);
  });
});
