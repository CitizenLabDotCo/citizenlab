import React from 'react';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  projectId?: string;
  customPageId?: string;
};

// The two routes are different members of the router's typed union, so each branch names its
// own rather than varying `to` on one element.
const UploadFilesLink = ({ projectId, customPageId }: Props) => {
  const { formatMessage } = useIntl();

  if (projectId) {
    return (
      <ButtonWithLink
        to="/admin/projects/$projectId/files"
        params={{ projectId }}
        buttonStyle="text"
        icon="upload-file"
        openLinkInNewTab={true}
      >
        {formatMessage(messages.uploadFiles)}
      </ButtonWithLink>
    );
  }

  if (customPageId) {
    return (
      <ButtonWithLink
        data-cy="e2e-upload-files-to-page"
        to="/admin/pages-menu/pages/$customPageId/attachments"
        params={{ customPageId }}
        buttonStyle="text"
        icon="upload-file"
        openLinkInNewTab={true}
      >
        {formatMessage(messages.uploadFilesToPage)}
      </ButtonWithLink>
    );
  }

  return null;
};

export default UploadFilesLink;
