import React, { useEffect, useState } from 'react';

import { Box, Spinner, colors } from '@citizenlab/cl2-component-library';

import Modal from 'design-system/Modal';

import useGroupsByIds from 'api/groups/useGroupsByIds';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';
import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import PhonePreviewBackdrop from 'containers/Admin/projects/_shared/components/PhonePreviewBackdrop';
import PreviewProjectButton from 'containers/Admin/projects/_shared/components/PreviewProjectButton';
import StageSkeleton from 'containers/Admin/projects/project/backofficeRedesign/WorkspaceSkeleton/StageSkeleton';

import PagePreview from 'components/admin/PagePreview';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { useParams, useSearch } from 'utils/router';

import messages from '../messages';

import styles from './ProjectPage.module.css';
import 'design-system/tokens.css';

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

  if (!project && redesign) return <StageSkeleton />;

  if (!project) {
    return (
      <Box
        minHeight="100%"
        background={colors.background}
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

  const groupsFailedOpen =
    failedGroupIds.length > 0 && failedGroups.every(Boolean);
  const groupsNotAddedText = formatMessage(messages.groupsNotAdded2, {
    groups: formatList(failedGroupTitles, { type: 'conjunction' }),
  });

  return (
    <PhonePreviewBackdrop
      action={redesign && <PreviewProjectButton slug={slug} />}
    >
      <Modal
        size={440}
        isOpen={groupsFailedOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeGroupsFailed();
        }}
        title={formatMessage(messages.groupsNotAddedTitle)}
        primaryAction={{
          label: formatMessage(messages.groupsNotAddedOk),
          onPress: closeGroupsFailed,
        }}
      >
        <p className={styles.groupsNotAdded}>{groupsNotAddedText}</p>
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
        editPageContentText={
          redesign ? formatMessage(messages.editProjectPage) : undefined
        }
        variant={redesign ? 'workspace' : 'default'}
      />
    </PhonePreviewBackdrop>
  );
};

export default ProjectPage;
