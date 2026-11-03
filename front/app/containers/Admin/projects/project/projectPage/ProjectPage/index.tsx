import React, { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Spinner,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import useGroupsByIds from 'api/groups/useGroupsByIds';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';
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
  const { formatMessage, formatList } = useIntl();
  const locale = useLocale();
  const localize = useLocalize();
  const { projectId } = useParams({
    from: '/$locale/admin/projects/$projectId/project-page',
  });
  const { groups_failed: groupsFailedParam } = useSearch({
    from: '/$locale/admin/projects/$projectId/project-page',
  });
  const [failedGroupIds, setFailedGroupIds] = useState(
    groupsFailedParam ? groupsFailedParam.split(',') : []
  );
  const failedGroups = useGroupsByIds(failedGroupIds);
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

  const closeGroupsFailed = () => setFailedGroupIds([]);
  const failedGroupTitles = failedGroups.flatMap((group) =>
    group ? [localize(group.data.attributes.title_multiloc)] : []
  );

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
        opened={failedGroupIds.length > 0 && failedGroups.every(Boolean)}
        close={closeGroupsFailed}
        width={480}
        variant="bo"
        header={formatMessage(messages.groupsNotAddedTitle)}
        footer={
          <Box w="100%" display="flex" justifyContent="flex-end">
            <Button
              buttonStyle="bo-primary"
              boSize="medium"
              onClick={closeGroupsFailed}
            >
              {formatMessage(messages.groupsNotAddedOk)}
            </Button>
          </Box>
        }
      >
        <Box p="24px">
          <Text m="0" fontSize="s" color="coolGrey600">
            {formatMessage(messages.groupsNotAdded2, {
              groups: formatList(failedGroupTitles, { type: 'conjunction' }),
            })}
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
