import React, { useState } from 'react';

import { Box, Text, Title, colors } from '@citizenlab/cl2-component-library';
import { useEditor } from '@craftjs/core';
import { Multiloc, SupportedLocale } from 'typings';

import useUpsertProjectPageLayout from 'api/content_builder/useUpsertProjectPageLayout';
import { IUpdatedProjectProperties } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import useLocalize from 'hooks/useLocalize';

import Container from 'components/admin/ContentBuilder/TopBar/Container';
import GoBackButton from 'components/admin/ContentBuilder/TopBar/GoBackButton';
import LocaleSelect from 'components/admin/ContentBuilder/TopBar/LocaleSelect';
import PreviewToggle from 'components/admin/ContentBuilder/TopBar/PreviewToggle';
import SaveButton from 'components/admin/ContentBuilder/TopBar/SaveButton';
import { findNodeIdByName } from 'components/ProjectPageBuilder/defaultLayout';
import {
  extractProjectAttributeDrafts,
  hasProjectAttributeDrafts,
  stripProjectAttributeDrafts,
} from 'components/ProjectPageBuilder/projectAttributeDrafts';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { type TypedLinkProps } from 'utils/cl-router/Link';
import { convertUrlToUploadFile } from 'utils/fileUtils';

import messages from '../messages';

type Props = {
  hasPendingState?: boolean;
  hasError?: boolean;
  previewEnabled: boolean;
  setPreviewEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLocale: SupportedLocale;
  onSelectLocale: (locale: SupportedLocale) => void;
  projectId: string;
  backPath: string;
  previewLink: TypedLinkProps;
  titleMultiloc: Multiloc;
};

const ProjectPageBuilderTopBar = ({
  previewEnabled,
  setPreviewEnabled,
  selectedLocale,
  onSelectLocale,
  hasError,
  hasPendingState,
  projectId,
  backPath,
  previewLink,
  titleMultiloc,
}: Props) => {
  const { query, actions } = useEditor();
  const localize = useLocalize();
  const { mutateAsync: upsertProjectPageLayout } = useUpsertProjectPageLayout();
  const { mutateAsync: updateProject } = useUpdateProject();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const disableSave = !!hasError || !!hasPendingState;

  const goBack = () => {
    clHistory.push(backPath);
  };

  // Two-step save: commit the widgets' project-attribute drafts to the project,
  // then persist the layout with the drafts stripped (see projectAttributeDrafts.ts).
  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(false);

    try {
      const nodes = query.getSerializedNodes();
      const drafts = extractProjectAttributeDrafts(nodes);

      if (hasProjectAttributeDrafts(drafts)) {
        const attributes: IUpdatedProjectProperties = { projectId };
        if (drafts.titleMultiloc) {
          attributes.title_multiloc = drafts.titleMultiloc;
        }
        if (drafts.bannerImageUrl) {
          const file = await convertUrlToUploadFile(drafts.bannerImageUrl);
          if (!file?.base64) {
            throw new Error('Could not read the uploaded project image');
          }
          attributes.header_bg = file.base64;
        } else if (drafts.bannerRemoved) {
          attributes.header_bg = null;
        }
        if (drafts.bannerAltMultiloc) {
          attributes.header_bg_alt_text_multiloc = drafts.bannerAltMultiloc;
        }
        await updateProject(attributes);
      }

      await upsertProjectPageLayout({
        projectId,
        craftjs_json: stripProjectAttributeDrafts(nodes),
      });

      // Reset the in-editor props so the widgets read the fresh project attributes.
      const titleNodeId = findNodeIdByName(nodes, 'ProjectTitle');
      if (titleNodeId) {
        actions.history.ignore().setProp(titleNodeId, (props) => {
          props.title = undefined;
        });
      }
      const bannerNodeId = findNodeIdByName(nodes, 'ProjectBanner');
      if (bannerNodeId) {
        actions.history.ignore().setProp(bannerNodeId, (props) => {
          props.image = {};
          props.alt = {};
        });
      }
    } catch {
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePreview = () => {
    setPreviewEnabled((previewEnabled) => !previewEnabled);
  };

  return (
    <Container>
      <GoBackButton onClick={goBack} />
      <Box display="flex" p="15px" pl="8px" flexGrow={1} alignItems="center">
        <Box flexGrow={2}>
          <Title variant="h3" as="h1" mb="0px" mt="0px">
            <FormattedMessage {...messages.projectPageHeading} />
          </Title>
          <Text m="0" color="textSecondary">
            {localize(titleMultiloc)}
          </Text>
        </Box>
        <LocaleSelect locale={selectedLocale} setLocale={onSelectLocale} />
        <Box ml="24px" />
        <PreviewToggle
          checked={previewEnabled}
          onChange={handleTogglePreview}
        />
        <ButtonWithLink
          id="e2e-view-project-button"
          icon="eye"
          buttonStyle="secondary-outlined"
          iconColor={colors.textPrimary}
          iconSize="20px"
          px="11px"
          py="6px"
          ml="32px"
          disabled={!titleMultiloc}
          openLinkInNewTab
          {...previewLink}
        />
        <SaveButton
          isDisabled={disableSave}
          isLoading={isSaving}
          onSave={handleSave}
        />
        {saveError && (
          <Text
            color="error"
            ml="20px"
            position="absolute"
            right="16px"
            bottom="-18px"
            fontSize="s"
          >
            <FormattedMessage {...messages.saveError} />
          </Text>
        )}
      </Box>
    </Container>
  );
};

export default ProjectPageBuilderTopBar;
