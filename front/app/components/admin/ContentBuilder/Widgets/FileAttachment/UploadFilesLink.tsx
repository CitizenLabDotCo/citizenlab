import React from 'react';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import { WrapperTo } from 'utils/cl-router/Link';

import messages from './messages';

type Props = {
  projectId?: string;
  customPageId?: string;
};

type UploadTarget = {
  to: WrapperTo;
  params: Record<string, string>;
  message: MessageDescriptor;
  dataCy?: string;
};

const UploadFilesLink = ({ projectId, customPageId }: Props) => {
  const { formatMessage } = useIntl();

  const target: UploadTarget | null = projectId
    ? {
        to: '/admin/projects/$projectId/files',
        params: { projectId },
        message: messages.uploadFiles,
      }
    : customPageId
    ? {
        to: '/admin/pages-menu/pages/$customPageId/attachments',
        params: { customPageId },
        message: messages.uploadFilesToPage,
        dataCy: 'e2e-upload-files-to-page',
      }
    : null;

  if (!target) return null;

  return (
    <ButtonWithLink
      data-cy={target.dataCy}
      to={target.to}
      params={target.params}
      buttonStyle="text"
      icon="upload-file"
      openLinkInNewTab={true}
    >
      {formatMessage(target.message)}
    </ButtonWithLink>
  );
};

export default UploadFilesLink;
