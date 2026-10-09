import React, { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Spinner,
  Text,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';

import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';
import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import PhonePreviewBackdrop from 'containers/Admin/projects/_shared/components/PhonePreviewBackdrop';

import PagePreview from 'components/admin/PagePreview';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { useParams, useSearch } from 'utils/router';

import messages from '../messages';

const ProjectPage = () => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { projectId } = useParams({
    from: '/$locale/admin/projects/$projectId/project-page',
  });
  const { groups_failed: groupsFailedParam } = useSearch({
    from: '/$locale/admin/projects/$projectId/project-page',
  });
  const [groupsFailed, setGroupsFailed] = useState(!!groupsFailedParam);
  const { data: project } = useProjectById(projectId);
  const redesign = useProjectBackofficeRedesign();

  useEffect(() => {
    if (groupsFailedParam) removeSearchParams(['groups_failed']);
  }, [groupsFailedParam]);

  if (!project) {
    return (
      <Box
        minHeight="100%"
        background={redesign ? colors.grey100 : colors.background}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner />
      </Box>
    );
  }

  const slug = project.data.attributes.slug;

  const closeGroupsFailed = () => setGroupsFailed(false);

  // Keep groups_failed out of the preview, or the iframe reloads once it is removed.
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.delete('groups_failed');
  const previewSearch = searchParams.toString();
  const search = previewSearch ? `?${previewSearch}` : '';

  const openContentBuilder = () => {
    clHistory.push(
      `/admin/project-page-builder/projects/${projectId}${window.location.search}`
    );
  };

  return (
    <PhonePreviewBackdrop>
      <Modal
        opened={groupsFailed}
        close={closeGroupsFailed}
        width={480}
        variant="bo"
        header={formatMessage(messages.groupsNotAddedTitle)}
        footer={
          <Box w="100%" display="flex" justifyContent="flex-end">
            <Button
              buttonStyle="bo-primary"
              height={bo.buttonMedium.height}
              padding={bo.buttonMedium.padding}
              fontSize={bo.buttonMedium.fontSize}
              onClick={closeGroupsFailed}
            >
              {formatMessage(messages.groupsNotAddedOk)}
            </Button>
          </Box>
        }
      >
        <Box p="24px">
          <Text m="0" fontSize="s" color="coolGrey600">
            {formatMessage(messages.groupsNotAdded)}
          </Text>
        </Box>
      </Modal>
      <PagePreview
        src={`/${locale}/projects/${slug}${search}`}
        iframeTitle={formatMessage(messages.projectPagePreviewTitle)}
        editPageContentAriaLabel={formatMessage(
          messages.editProjectPageInContentBuilder
        )}
        onEdit={openContentBuilder}
        dataCy="e2e-project-page-preview"
        editPageContentClassName="intercom-product-tour-project-edit-project"
      />
    </PhonePreviewBackdrop>
  );
};

export default ProjectPage;
